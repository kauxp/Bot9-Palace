import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { Conversation } from './models.js';

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: dotenv.OPENAI_API_KEY,
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// Fetch room options
const getRoomOptions = async () => {
    try {
        const response = await axios.get('https://bot9assignement.deno.dev/rooms');
        const rooms = response.data;
        let roomOptions = "Here are the available rooms:\n";
        rooms.forEach((room) => {
            roomOptions += `Room ID: ${room.id}, Name: ${room.name}, Price: ${room.price}\n`;
        });
        return roomOptions;
    } catch (error) {
        console.error('Error fetching room options:', error);
        return null;
    }
};

// Simulate booking a room
const bookRoom = async (roomId, name, email, nights) => {
    try {
        const response = await axios.post('https://bot9assignement.deno.dev/book', {
            "roomId": roomId,
            "fullName": name,
            "email": email,
            "nights": nights,
        },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            });
        return `Booking confirmed! Your booking ID is ${response.data.bookingId}.`;
    } catch (error) {
        console.error('Error booking room:', error);
        return `Sorry, there was an error booking your room. Please try again later.`;;
    }
};

const systemPrompts = [
    { role: "system", content: "You are a hotel booking assistant at BOT9 Palace." },
    { role: "system", content: "You can help users book rooms and get information about available rooms." },
    { role: "system", content: "You can ask user to book a room or get available rooms." },
    { role: "system", content: "You should understand when user asks to book a room and you should proceed with the room booking." },
    { role: "system", content: "If user talks about different topics, or going off topic you should remid him that this is a hotel booking bot." },
    { role: "system", content: "If user talks in diffrent language repond in the same tone and language as the user"}
];

async function chat(req, res, userChat, userId) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: userChat, 
            functions: [
                {
                    name: "book_room",
                    description: "Book a room for the user at the hotel.",
                    parameters: {
                        type: "object",
                        properties: {
                            room_name: {
                                type: "string",
                                description: "The name of the room to book",
                            },
                            name: {
                                type: "string",
                                description: "The name of the person booking the room",
                            },
                            email: {
                                type: "string",
                                description: "The email of the person booking the room",
                            },
                            nights: {
                                type: "number",
                                description: "The number of nights to book the room for",
                            },
                        },
                        required: [], 
                    },
                },
                {
                    name: "get_rooms_when_user_asks_for_available_rooms",
                    description: "Get available rooms at the hotel when user asks for available rooms",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The query to search for rooms",
                            },
                        },
                        required: [], 
                    },
                },
            ],
        });

        var reply = response.choices[0].message.content || "NULL";
        const toolCall = response.choices[0].message.function_call;

        if (toolCall && toolCall.name === 'get_rooms_when_user_asks_for_available_rooms') {
            var rooms = await getRoomOptions();
            console.log(rooms)
            if (!rooms) {
                reply = `Sorry, there are no rooms available at the moment.`;
            } else {
                reply = await getRoomOptions();
            }
            await Conversation.create({ userId, content: reply, role: "assistant" });
            return res.json({ reply });
        } else if (toolCall && toolCall.name === 'book_room') {
            let { room_name, name, email, nights } = JSON.parse(toolCall.arguments || "{}");

            if (!room_name || !name || !email || !nights) {
                reply = `Please provide the necessary details for booking: room name, your name, email, and number of nights.`;
            } else {
                reply = await bookRoom(1, name, email, nights);
            }
            await Conversation.create({ userId, content: reply, role: "assistant" });
            return res.json({ reply });
        } else {
            reply = response.choices[0].message.content || "NULL";
        }

        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
}

app.post('/chat', async (req, res) => {
    const { userId, content } = req.body;

    try {
        await Conversation.bulkCreate(systemPrompts.map(prompt => ({
            userId,
            content: prompt.content,
            role: prompt.role
        })));

        await Conversation.create({ userId, content, role: "user" });

        const userChat = await Conversation.findAll({
            attributes: ["content", "role"],
            where: { userId }
        });

        const extractedData = userChat.map(conversation => ({
            content: conversation.dataValues.content,
            role: conversation.dataValues.role
        }));

        if (extractedData.length > 0) {
            await chat(req, res, extractedData, userId);
        } else {
            res.status(400).send('User not found');
        }
    } catch (error) {
        console.error('Error handling chat request:', error);
        res.status(500).send('An error occurred');
    }
});


