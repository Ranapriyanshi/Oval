# Oval App - Development Roadmap

## Phase 1: Foundation ✅ (COMPLETED)

### Backend
- [x] **Project setup**
  - React Native Expo + Node.js/Express
  - Database setup with Sequelize migrations
  - User authentication (JWT-based)
  - Multi-country support foundation
  - CORS configuration for development

### Frontend
- [x] **Project setup**
  - React Native Expo
  - Internationalization (i18n) with en-AU and en-US
  - Basic navigation structure
  - User profile management
  - 3D assets structure (placeholder)

---

## Phase 2: Core Venue & Booking System ✅ (COMPLETED)

### Backend
- [x] **Venue Models & Migrations**
  - Venues table (name, address, coordinates, amenities, pricing)
  - Venue availability/slots table
  - Venue ratings table
  - Venue images table
  - Venue sports mapping (many-to-many)

- [x] **Venue API Routes**
  - `GET /api/venues` - List/search venues (with filters: sport, location, price)
  - `GET /api/venues/:id` - Get venue details
  - `GET /api/venues/:id/availability` - Check available time slots
  - `POST /api/venues/:id/book` - Book a venue slot
  - `GET /api/bookings` - User's bookings
  - `PUT /api/bookings/:id/cancel` - Cancel booking
  - `POST /api/venues/:id/rate` - Rate a venue

- [x] **Location Services**
  - Integration with Google Maps API
  - Geocoding (address to coordinates)
  - Distance calculation
  - Nearby venues search

### Frontend
- [x] **Venue Discovery Screen**
  - Map view with venue markers
  - List view with filters (sport, distance, price, rating)
  - Search functionality
  - 3D illustrations for venue types

- [x] **Venue Detail Screen**
  - Venue information, photos, amenities
  - Availability calendar
  - Pricing display (localized currency)
  - Reviews and ratings
  - Book button

- [x] **Booking Flow**
  - Time slot selection
  - Booking confirmation
  - Payment integration (Stripe) - basic
  - Booking history screen

- [x] **My Bookings Screen**
  - Upcoming bookings
  - Past bookings
  - Booking cancellation

---

## Phase 3: Playpals & Matching System ✅ (COMPLETED)

### Backend
- [x] **User Profile Extensions**
  - Sports preferences table
  - Skill level per sport
  - Availability schedule
  - Play style preferences
  - Profile photos

- [x] **Matching Algorithm**
  - Location-based matching
  - Sport preference matching
  - Skill level compatibility
  - Availability matching
  - Swipe/match system (like Tinder)

- [x] **Playpal API Routes**
  - `GET /api/playpals/discover` - Get potential matches
  - `POST /api/playpals/:id/swipe` - Swipe right/left
  - `GET /api/playpals/matches` - Get matched users
  - `POST /api/playpals/:id/unmatch` - Unmatch a user
  - `GET /api/playpals/:id/profile` - View playpal profile

### Frontend
- [x] **Playpal Discovery Screen**
  - Card-based swipe interface (Tinder-style)
  - User profile cards with 3D illustrations
  - Swipe gestures (left = pass, right = like)
  - Match animation

- [x] **Matches Screen**
  - List of matched playpals
  - Chat initiation
  - View match profile
  - Unmatch option

- [x] **Playpal Profile Screen**
  - Sports played, skill levels
  - Availability
  - Mutual interests
  - Rating/reviews from others

---

## Phase 4: Gametime Activities ✅ (COMPLETED)

### Backend
- [x] **Gametime Models**
  - Gametime events table (pre-organized games)
  - Gametime participants table
  - Event types (casual, competitive, training)

- [x] **Gametime API Routes**
  - `GET /api/gametime` - List available gametime events
  - `GET /api/gametime/:id` - Get event details
  - `POST /api/gametime` - Create a gametime event (admin/coach)
  - `POST /api/gametime/:id/join` - Join a gametime
  - `POST /api/gametime/:id/leave` - Leave a gametime
  - `GET /api/gametime/my-events` - User's gametime events

### Frontend
- [x] **Gametime Discovery Screen**
  - List of upcoming gametime events
  - Filters (sport, date, location, skill level)
  - Event cards with 3D illustrations

- [x] **Gametime Detail Screen**
  - Event information
  - Participants list
  - Join/leave functionality
  - Event organizer info

- [x] **My Gametime Screen**
  - Upcoming events user joined
  - Past events
  - Event history

---

## Phase 5: Chat & Messaging ✅ (COMPLETED)

### Backend
- [x] **Chat Models**
  - Conversations table
  - Messages table
  - Message read status

- [x] **Socket.io Integration**
  - Real-time message delivery
  - Typing indicators
  - Online/offline status
  - Push notifications (Firebase FCM)

- [x] **Chat API Routes**
  - `GET /api/chat/conversations` - List user conversations
  - `GET /api/chat/conversations/:id/messages` - Get messages
  - `POST /api/chat/conversations/:id/messages` - Send message (fallback)
  - `POST /api/chat/conversations` - Start new conversation

### Frontend
- [x] **Chat List Screen**
  - List of conversations
  - Last message preview
  - Unread message count
  - 3D avatar illustrations

- [x] **Chat Screen**
  - Message bubbles
  - Real-time updates via Socket.io
  - Typing indicators
  - Send message input
  - Image sharing (basic)

---

## Phase 6: Coaching & Training ✅ (COMPLETED)

### Backend
- [x] **Coach Models**
  - Coaches table (verified coaches)
  - Coach specializations
  - Coach availability
  - Coach ratings/reviews
  - Coach certifications

- [x] **Coaching API Routes**
  - `GET /api/coaches` - List/search coaches
  - `GET /api/coaches/:id` - Get coach profile
  - `POST /api/coaches/:id/book` - Book coaching session
  - `GET /api/coaching/sessions` - User's coaching sessions
  - `POST /api/coaches/:id/rate` - Rate a coach

### Frontend
- [x] **Coach Discovery Screen**
  - List of coaches with filters
  - Coach cards with ratings
  - Specialization tags

- [x] **Coach Profile Screen**
  - Coach bio, certifications
  - Specializations
  - Availability calendar
  - Reviews and ratings
  - Book session button

- [x] **My Coaching Screen**
  - Upcoming sessions
  - Past sessions
  - Coach contact info

---

## Phase 7: Skill Tracking & Leaderboards ✅ (COMPLETED)

### Backend
- [x] **Stats Models**
  - User stats per sport
  - Game history
  - Performance metrics
  - Karma points system
  - Leaderboards table

- [x] **Stats API Routes**
  - `GET /api/stats` - User's overall stats
  - `GET /api/stats/:sport` - Stats for specific sport
  - `GET /api/leaderboards` - Global leaderboards
  - `GET /api/leaderboards/:sport` - Sport-specific leaderboard
  - `POST /api/games/:id/rate` - Rate a player after game
  - `GET /api/karma` - User's karma points

### Frontend
- [x] **Stats Dashboard**
  - Overall performance metrics
  - Sport-specific stats
  - Progress charts (3D visualizations)
  - Karma points display

- [x] **Leaderboards Screen**
  - Global leaderboard
  - Sport-specific leaderboards
  - Friends leaderboard
  - Filter by country/region

- [x] **Game Rating Screen**
  - Rate players after a game
  - Skill level feedback
  - Sportsmanship rating

---

## Phase 8: Events & Tournaments ✅ (COMPLETED)

### Backend
- [x] **Event Models**
  - Tournaments table
  - Tournament brackets
  - Tournament participants
  - Event registration

- [x] **Event API Routes**
  - `GET /api/events` - List events/tournaments
  - `GET /api/events/:id` - Get event details
  - `POST /api/events` - Create event (organizer)
  - `POST /api/events/:id/register` - Register for event
  - `GET /api/events/my-events` - User's events

### Frontend
- [x] **Events Discovery Screen**
  - List of upcoming events
  - Tournament brackets visualization
  - Registration status

- [x] **Event Detail Screen**
  - Event information
  - Participants list
  - Bracket view (if tournament)
  - Register button

---

## Phase 9: Achievements & Badges ✅ (COMPLETED)

### Backend
- [x] **Achievement Models**
  - Achievements table
  - User achievements (earned badges)
  - Achievement progress tracking

- [x] **Achievement API Routes**
  - `GET /api/achievements` - List all achievements
  - `GET /api/achievements/my` - User's achievements
  - `POST /api/achievements/check` - Check and award achievements

### Frontend
- [x] **Achievements Screen**
  - Badge collection display
  - Achievement progress
  - Unlocked vs locked badges
  - 3D badge illustrations

---

## Phase 10: Weather Integration & Smart Recommendations ✅ (COMPLETED)

### Backend
- [x] **Weather Service**
  - OpenWeatherMap API integration
  - Weather-based game recommendations
  - Weather alerts for bookings

- [x] **Recommendation Engine**
  - Weather-based suggestions
  - Activity recommendations
  - Optimal time suggestions

### Frontend
- [x] **Weather Widget**
  - Current weather display
  - Weather-based recommendations
  - Activity suggestions based on weather

---

## Phase 11: Advanced Features 🚀 (DEFERRED)

### Backend
- [ ] **Payment Integration**
  - Stripe full integration
  - Payment history
  - Refund handling
  - Subscription management

- [ ] **Notifications**
  - Push notifications (Firebase FCM)
  - Email notifications
  - In-app notifications
  - Notification preferences

- [ ] **File Storage**
  - AWS S3 or Cloudinary integration
  - Image upload for venues, profiles
  - Document upload for coaches

- [ ] **Search & Filtering**
  - Advanced search with Elasticsearch (optional)
  - Full-text search
  - Faceted filtering

### Frontend
- [x] **Advanced UI/UX**
  - Full 3D asset integration
  - Animations and transitions
  - Dark mode support
  - Accessibility improvements

- [ ] **Social Features**
  - Friend system
  - Activity feed
  - Share functionality
  - Social media integration

---

## Phase 12: Admin & Analytics ✅ (COMPLETED)

### Backend
- [x] **Admin Panel API**
  - Admin authentication
  - Venue management
  - User management
  - Content moderation
  - Analytics endpoints

- [x] **Analytics**
  - Usage analytics
  - Revenue tracking
  - User engagement metrics
  - Performance monitoring

### Frontend
- [x] **Admin Dashboard** (Web or Mobile)
  - Venue management
  - User management
  - Content moderation tools
  - Analytics dashboard

---

## Technical Debt & Improvements

- [ ] **Performance Optimization**
  - Database query optimization
  - Caching (Redis)
  - Image optimization
  - Code splitting

- [ ] **Testing**
  - Unit tests (Jest)
  - Integration tests
  - E2E tests (Detox)
  - API testing

- [ ] **Security**
  - Rate limiting improvements
  - Input validation
  - SQL injection prevention
  - XSS protection
  - Security audits

- [ ] **Documentation**
  - API documentation (Swagger)
  - Component documentation
  - Deployment guides
  - Architecture diagrams

---

## Priority Recommendations

### High Priority (Next 2-3 Phases)
1. **Phase 2: Venue Booking** - Core revenue feature
2. **Phase 3: Playpals** - Core community feature
3. **Phase 5: Chat** - Essential for user engagement

### Medium Priority
4. **Phase 4: Gametime** - Differentiates from competitors
5. **Phase 6: Coaching** - Additional revenue stream
6. **Phase 7: Skill Tracking** - Gamification and retention

### Lower Priority (Can be done in parallel)
7. **Phase 8: Events & Tournaments**
8. **Phase 9: Achievements**
9. **Phase 10: Weather Integration**

---

## Estimated Timeline

- **Phase 2**: 4-6 weeks
- **Phase 3**: 3-4 weeks
- **Phase 4**: 2-3 weeks
- **Phase 5**: 3-4 weeks
- **Phase 6**: 3-4 weeks
- **Phase 7**: 2-3 weeks
- **Phase 8**: 2-3 weeks
- **Phase 9**: 1-2 weeks
- **Phase 10**: 1-2 weeks
- **Phase 11**: 4-6 weeks
- **Phase 12**: 3-4 weeks

**Total Estimated Time**: ~30-40 weeks (7-10 months) for full feature set

---

## Notes

- Phases can be adjusted based on business priorities
- Some features can be developed in parallel
- MVP could include Phases 2, 3, and 5 for initial launch
- Continuous integration of 3D assets throughout all phases
- Multi-country support should be considered in each phase
