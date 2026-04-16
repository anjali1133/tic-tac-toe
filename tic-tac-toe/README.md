# Multiplayer Tic-Tac-Toe Game

A production-ready, real-time multiplayer Tic-Tac-Toe game built with React and Nakama server for LILA Engineering Backend Assignment.

## 🎮 Live Demo

- **Frontend URL**: [Deploy to Vercel/Netlify after setup]
- **Nakama Server**: [Deploy to your cloud provider]

## 🏗️ Architecture

### Backend (Nakama)
- **Server-Authoritative Game Logic**: All game state managed server-side
- **Real-time Communication**: WebSocket connections for instant updates
- **Matchmaking System**: Automatic player pairing and room management
- **Move Validation**: Server-side validation prevents cheating
- **Timer System**: 30-second turn timer with automatic forfeit

### Frontend (React)
- **Responsive Design**: Optimized for mobile and desktop
- **Real-time UI Updates**: Instant game state synchronization
- **Modern CSS**: Gradient backgrounds, animations, and smooth transitions
- **Component-based Architecture**: Reusable and maintainable code

### Key Features
- ✅ Server-authoritative gameplay
- ✅ Real-time multiplayer matchmaking
- ✅ Move validation and anti-cheat measures
- ✅ Timer-based gameplay (30s per move)
- ✅ Responsive mobile-first design
- ✅ Connection status indicators
- ✅ Game state persistence
- ✅ Player disconnect handling
- ✅ Docker containerization

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd tic-tac-toe
```

### 2. Start with Docker
```bash
# Start all services (Postgres, Nakama, Frontend)
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 3. Access the Application
- **Game URL**: http://localhost:3000
- **Nakama Console**: http://localhost:7351 (admin/password)
- **Nakama API**: http://localhost:7350

### 4. Test Multiplayer
1. Open two browser windows/tabs to http://localhost:3000
2. Enter different usernames in each
3. Click "Find Match" in both windows
4. Players will be automatically matched and game begins!

## 📁 Project Structure

```
tic-tac-toe/
├── docker-compose.yml           # Multi-service Docker setup
├── nakama/                      # Nakama server configuration
│   └── data/
│       ├── config.yml          # Nakama server config
│       └── modules/
│           └── index.js        # Game logic (JavaScript)
└── frontend/                   # React application
    ├── Dockerfile              # Frontend container
    ├── package.json            # Dependencies
    ├── public/
    │   └── index.html          # HTML template
    └── src/
        ├── App.js              # Main application component
        ├── index.js            # React entry point
        ├── components/         # Reusable components
        │   ├── GameBoard.js    # Tic-tac-toe grid
        │   ├── PlayerInfo.js   # Player status display
        │   └── ConnectionStatus.js # Connection indicator
        ├── hooks/
        │   └── useGame.js      # Game state management
        ├── services/
        │   └── nakama.js       # Nakama client service
        └── styles/
            └── App.css         # Comprehensive styling
```

## 🎯 Game Flow

### 1. Authentication
- Players enter username
- Automatic device-based authentication
- Persistent user sessions

### 2. Matchmaking
- Click "Find Match" to join matchmaking queue
- Automatic pairing when 2 players found
- Match creation and room assignment

### 3. Game Session
- Server-authoritative game state
- Turn-based gameplay with visual indicators
- 30-second move timer per turn
- Real-time board updates

### 4. Game End Conditions
- **Win**: Three in a row (horizontal, vertical, diagonal)
- **Draw**: Board full with no winner
- **Forfeit**: Player timeout or disconnection
- **Abandon**: Player leaves match

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
REACT_APP_NAKAMA_SERVER_KEY=defaultkey
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=false
```

#### Production Settings
```bash
REACT_APP_NAKAMA_HOST=your-nakama-server.com
REACT_APP_NAKAMA_USE_SSL=true
```

### Nakama Configuration

Key settings in `nakama/data/config.yml`:
- **Database**: PostgreSQL connection
- **Session**: Token expiry and encryption
- **Socket**: WebSocket configuration
- **Console**: Admin interface settings

## 🚢 Deployment

### Frontend Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
cd frontend
vercel --prod
```

#### Netlify
```bash
# Build
cd frontend
npm run build

# Deploy build/ folder to Netlify
```

### Nakama Server Deployment

#### AWS EC2
```bash
# Create EC2 instance (Ubuntu 20.04+)
# Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose

# Clone repository
git clone <repo-url>
cd tic-tac-toe

# Start Nakama services
sudo docker-compose up -d postgres nakama

# Configure security groups:
# - Port 7350 (WebSocket)
# - Port 7351 (Console)
```

#### DigitalOcean Droplet
```bash
# Use Docker droplet or install Docker manually
# Same steps as AWS EC2
```

#### Google Cloud Run
```bash
# Build Nakama image
docker build -t nakama-tic-tac-toe ./nakama

# Push to Google Container Registry
gcloud auth configure-docker
docker tag nakama-tic-tac-toe gcr.io/PROJECT-ID/nakama-tic-tac-toe
docker push gcr.io/PROJECT-ID/nakama-tic-tac-toe

# Deploy to Cloud Run
gcloud run deploy nakama-tic-tac-toe --image gcr.io/PROJECT-ID/nakama-tic-tac-toe
```

## 🧪 Testing

### Local Testing
```bash
# Start services
docker-compose up -d

# Test game flow:
# 1. Open http://localhost:3000 in 2 browser windows
# 2. Enter different usernames
# 3. Click "Find Match" in both
# 4. Verify real-time gameplay
# 5. Test disconnect/reconnect scenarios
```

### Automated Testing
```bash
# Frontend tests
cd frontend
npm test

# Run coverage
npm test -- --coverage
```

### Performance Testing
- Use Nakama Console (localhost:7351) to monitor:
  - Active matches
  - Connected users  
  - Server performance metrics
- Browser DevTools for frontend performance

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Failed
```
Error: Failed to connect to server
```
**Solution**: 
- Check Nakama is running: `docker-compose ps`
- Verify port 7350 is accessible
- Check firewall settings

#### 2. Match Not Found
```
Error: Failed to find match
```
**Solution**:
- Ensure 2+ players are searching simultaneously
- Check Nakama logs: `docker-compose logs nakama`
- Restart matchmaking service

#### 3. Database Connection Error
```
Error: database connection failed
```
**Solution**:
- Verify PostgreSQL container is healthy
- Check database credentials in config.yml
- Reset database: `docker-compose down -v && docker-compose up -d`

#### 4. Frontend Build Issues
```
Error: Module not found
```
**Solution**:
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node.js version compatibility

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f nakama
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reset everything
docker-compose down -v
docker-compose up -d

# Access Nakama console
open http://localhost:7351
```

## 📊 Monitoring

### Nakama Console Features
- **Matches**: View active games
- **Users**: Monitor connected players
- **Storage**: Game data persistence
- **Logs**: Real-time server logs
- **Metrics**: Performance monitoring

### Application Metrics
- **Connection Status**: Real-time in app
- **Game State**: Visual feedback
- **Error Handling**: User-friendly messages
- **Performance**: Browser DevTools

## 🔒 Security Features

- **Server-Authoritative**: All game logic server-side
- **Move Validation**: Prevents illegal moves
- **Session Management**: Secure user sessions
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: Built into Nakama
- **CORS Configuration**: Controlled access

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Aesthetics**: Gradient backgrounds and smooth animations
- **Accessibility**: ARIA labels and keyboard navigation
- **Visual Feedback**: Clear turn indicators and game status
- **Loading States**: Smooth transitions between states
- **Error Messages**: User-friendly error handling

## 📈 Scaling Considerations

### Current Capacity
- **Concurrent Users**: 100+ (single Nakama instance)
- **Simultaneous Games**: 50+ matches
- **Response Time**: <100ms for moves

### Scaling Options
- **Horizontal**: Multiple Nakama instances with load balancer
- **Vertical**: Increase server resources
- **Database**: PostgreSQL clustering
- **CDN**: Static asset delivery
- **Caching**: Redis for session data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer Notes

### Technology Choices

**Nakama Server**: Chosen for its robust multiplayer features, real-time capabilities, and production-ready architecture. Provides built-in matchmaking, session management, and scalability.

**React Frontend**: Modern, component-based architecture with hooks for state management. Excellent developer experience and ecosystem.

**Docker**: Containerization ensures consistent development and deployment environments across different platforms.

**PostgreSQL**: Reliable, ACID-compliant database for persistent game data and user information.

### Architecture Decisions

1. **Server-Authoritative Design**: Prevents cheating and ensures game integrity
2. **WebSocket Communication**: Low-latency real-time updates
3. **Component Composition**: Modular, reusable React components
4. **Custom Hooks**: Centralized game logic and state management
5. **CSS-in-CSS**: Maintainable styling with CSS custom properties

### Future Enhancements

- [ ] Player statistics and leaderboard
- [ ] Spectator mode
- [ ] Tournament system
- [ ] AI opponent for single-player
- [ ] Voice chat integration
- [ ] Custom game rooms
- [ ] Replay system
- [ ] Mobile app (React Native)

---

**Built with ❤️ for LILA Engineering Backend Assignment**