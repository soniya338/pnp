# POP N' PLAN - College Committee & Event Management Platform

A comprehensive platform for managing college committees, events, and member interactions.

## Features

- **Member Dashboard**: Modern Instagram/Facebook-like interface for posting achievements
- **Admin Dashboard**: Complete management system for events, members, and communications
- **Event Management**: Create, manage, and register for events
- **Messaging System**: Real-time communication between members and admins
- **Committee Management**: Join and manage various college committees
- **Social Features**: Like, comment, and share posts

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: SendGrid
- **Deployment**: Vercel

## Deployment on Vercel

1. **Fork/Clone this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   MONGO_URI=your_mongodb_connection_string
   SENDGRID_API_KEY=your_sendgrid_api_key
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

4. **Deploy**: Vercel will automatically deploy your application

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   SENDGRID_API_KEY=your_sendgrid_api_key
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Main site: http://localhost:5000
   - Admin dashboard: http://localhost:5000/admin
   - Member dashboard: http://localhost:5000/dash

## Project Structure

```
├── server.js              # Main server file
├── index.js               # Vercel entry point
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
├── admin.html             # Admin dashboard
├── dash.html              # Member dashboard
├── login.html             # Login page
├── member.html            # Member registration
├── event.html             # Event management
├── auth.js                # Authentication routes
├── memberAuth.js          # Member authentication
├── eventRoutes.js         # Event management routes
├── messageRoutes.js       # Messaging routes
└── uploads/               # File uploads directory
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/member/register` - Member registration
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations` - Get conversations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, email support@popnplan.com or create an issue in the repository.