# Hotel Booking Chatbot

A comprehensive hotel booking chatbot that leverages OpenAI's API for natural language processing. The chatbot maintains conversation history, fetches room options from an external API, and simulates room booking.

## Table of Contents

- [Overview](#overview)
- [Technical Requirements](#technical-requirements)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Usage](#api-usage)
- [Testing](#testing)
- [Skills Demonstrated](#skills-demonstrated)
- [Bonus Features](#bonus-features)
- [About](#about)

## Overview

This hotel booking chatbot application is designed to handle hotel booking queries by interacting with users through a natural language interface. The application consists of a backend powered by Express.js.

## Technical Requirements

- **Backend Framework**: Express.js
- **Natural Language Processing**: OpenAI's API
- **Database**: SQLite with Sequelize ORM
- **Functionality**:
  - Fetches room options from an external API.
  - Simulates room booking.
  - Maintains conversation history.

## Prerequisites

- Node.js (version 14.x or later)
- npm (version 6.x or later)
- SQLite3

## Installation

### Clone the Repository

```bash
git clone https://github.com/Rudrakc/hotel-booking-chatbot.git
cd hotel-booking-chatbot
```

## Backend Setup

### Install dependencies: 
`npm install`

### Configuration: 
Create a `.env` file in the root directory and add your OpenAI API key and PORT you want to use. For reference you can check `.env-example`.

### Running the Backend Server:
To start the server: `npm run dev`

The application should now be running.

## API Usage

### Main Endpoint

#### POST /chat
Handle user messages and return chatbot responses.

### Example API request

```
curl -X POST http://localhost:5000/chat \
     -H "Content-Type: application/json" \
     -d '{
           "message": "I want to book a hotel room for tomorrow",
           "userId": "user123"
           "role": "user"
         }'
```

### Example API Response

```
{
  "response": "Sure, I can help with that. Can you please provide more details about your booking such as the location and type of room?"
}
```

## Testing

To test the chatbot API, you can use tools like curl or Postman to send requests.