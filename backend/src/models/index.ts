import sequelize from '../config/sequelize';
import User from './User';
import Venue from './Venue';
import VenueSport from './VenueSport';
import VenueImage from './VenueImage';
import VenueSchedule from './VenueSchedule';
import Booking from './Booking';
import VenueRating from './VenueRating';
import UserSportsSkill from './UserSportsSkill';
import UserAvailability from './UserAvailability';
import UserProfilePhoto from './UserProfilePhoto';
import UserSwipe from './UserSwipe';
import UserMatch from './UserMatch';
import Gametime from './Gametime';
import GametimeParticipant from './GametimeParticipant';
import Conversation from './Conversation';
import Message from './Message';
import Coach from './Coach';
import CoachAvailability from './CoachAvailability';
import CoachingSession from './CoachingSession';
import CoachRating from './CoachRating';
import UserStats from './UserStats';
import GameHistory from './GameHistory';
import PlayerRating from './PlayerRating';
import Event from './Event';
import EventRegistration from './EventRegistration';
import Achievement from './Achievement';
import UserAchievement from './UserAchievement';

// Venue associations
Venue.hasMany(VenueSport, { foreignKey: 'venue_id' });
VenueSport.belongsTo(Venue, { foreignKey: 'venue_id' });

Venue.hasMany(VenueImage, { foreignKey: 'venue_id' });
VenueImage.belongsTo(Venue, { foreignKey: 'venue_id' });

Venue.hasMany(VenueSchedule, { foreignKey: 'venue_id' });
VenueSchedule.belongsTo(Venue, { foreignKey: 'venue_id' });

Venue.hasMany(Booking, { foreignKey: 'venue_id' });
Booking.belongsTo(Venue, { foreignKey: 'venue_id' });

Venue.hasMany(VenueRating, { foreignKey: 'venue_id' });
VenueRating.belongsTo(Venue, { foreignKey: 'venue_id' });

// User associations
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(VenueRating, { foreignKey: 'user_id' });
VenueRating.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserSportsSkill, { foreignKey: 'user_id' });
UserSportsSkill.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserAvailability, { foreignKey: 'user_id' });
UserAvailability.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserProfilePhoto, { foreignKey: 'user_id' });
UserProfilePhoto.belongsTo(User, { foreignKey: 'user_id' });

// Swipe/Match associations
User.hasMany(UserSwipe, { foreignKey: 'swiper_id', as: 'SwipesGiven' });
User.hasMany(UserSwipe, { foreignKey: 'swiped_id', as: 'SwipesReceived' });
UserSwipe.belongsTo(User, { foreignKey: 'swiper_id', as: 'Swiper' });
UserSwipe.belongsTo(User, { foreignKey: 'swiped_id', as: 'Swiped' });

User.hasMany(UserMatch, { foreignKey: 'user1_id', as: 'MatchesAsUser1' });
User.hasMany(UserMatch, { foreignKey: 'user2_id', as: 'MatchesAsUser2' });
UserMatch.belongsTo(User, { foreignKey: 'user1_id', as: 'User1' });
UserMatch.belongsTo(User, { foreignKey: 'user2_id', as: 'User2' });

// Gametime associations
User.hasMany(Gametime, { foreignKey: 'creator_id', as: 'CreatedGametimes' });
Gametime.belongsTo(User, { foreignKey: 'creator_id', as: 'Creator' });

Gametime.hasMany(GametimeParticipant, { foreignKey: 'gametime_id', as: 'GametimeParticipants' });
GametimeParticipant.belongsTo(Gametime, { foreignKey: 'gametime_id', as: 'Gametime' });

User.hasMany(GametimeParticipant, { foreignKey: 'user_id', as: 'GametimeJoined' });
GametimeParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Chat associations
Conversation.belongsTo(User, { foreignKey: 'participant1_id', as: 'Participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2_id', as: 'Participant2' });
Conversation.belongsTo(Message, { foreignKey: 'last_message_id', as: 'LastMessage' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'Messages' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'Conversation' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });

User.hasMany(Conversation, { foreignKey: 'participant1_id', as: 'ConversationsAsP1' });
User.hasMany(Conversation, { foreignKey: 'participant2_id', as: 'ConversationsAsP2' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages' });

// Coaching associations
User.hasOne(Coach, { foreignKey: 'user_id', as: 'CoachProfile' });
Coach.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Coach.hasMany(CoachAvailability, { foreignKey: 'coach_id', as: 'Availabilities' });
CoachAvailability.belongsTo(Coach, { foreignKey: 'coach_id', as: 'Coach' });

Coach.hasMany(CoachingSession, { foreignKey: 'coach_id', as: 'Sessions' });
CoachingSession.belongsTo(Coach, { foreignKey: 'coach_id', as: 'Coach' });

User.hasMany(CoachingSession, { foreignKey: 'student_id', as: 'BookedSessions' });
CoachingSession.belongsTo(User, { foreignKey: 'student_id', as: 'Student' });

Coach.hasMany(CoachRating, { foreignKey: 'coach_id', as: 'Ratings' });
CoachRating.belongsTo(Coach, { foreignKey: 'coach_id', as: 'Coach' });

User.hasMany(CoachRating, { foreignKey: 'user_id', as: 'CoachRatingsGiven' });
CoachRating.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

CoachingSession.hasOne(CoachRating, { foreignKey: 'session_id', as: 'Rating' });
CoachRating.belongsTo(CoachingSession, { foreignKey: 'session_id', as: 'Session' });

// Stats & leaderboards associations
User.hasMany(UserStats, { foreignKey: 'user_id', as: 'Stats' });
UserStats.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasMany(GameHistory, { foreignKey: 'user_id', as: 'GameHistory' });
GameHistory.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Gametime.hasMany(GameHistory, { foreignKey: 'gametime_id', as: 'GameHistory' });
GameHistory.belongsTo(Gametime, { foreignKey: 'gametime_id', as: 'Gametime' });

Gametime.hasMany(PlayerRating, { foreignKey: 'gametime_id', as: 'PlayerRatings' });
PlayerRating.belongsTo(Gametime, { foreignKey: 'gametime_id', as: 'Gametime' });
User.hasMany(PlayerRating, { foreignKey: 'rater_id', as: 'RatingsGiven' });
User.hasMany(PlayerRating, { foreignKey: 'rated_user_id', as: 'RatingsReceived' });
PlayerRating.belongsTo(User, { foreignKey: 'rater_id', as: 'Rater' });
PlayerRating.belongsTo(User, { foreignKey: 'rated_user_id', as: 'RatedUser' });

// Events & Tournaments
User.hasMany(Event, { foreignKey: 'organizer_id', as: 'OrganizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizer_id', as: 'Organizer' });
Venue.hasMany(Event, { foreignKey: 'venue_id', as: 'Events' });
Event.belongsTo(Venue, { foreignKey: 'venue_id', as: 'Venue' });
Event.hasMany(EventRegistration, { foreignKey: 'event_id', as: 'Registrations' });
EventRegistration.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });
User.hasMany(EventRegistration, { foreignKey: 'user_id', as: 'EventRegistrations' });
EventRegistration.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Achievements
Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id', as: 'UserAchievements' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id', as: 'Achievement' });
User.hasMany(UserAchievement, { foreignKey: 'user_id', as: 'Achievements' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

const models = {
  User,
  Venue,
  VenueSport,
  VenueImage,
  VenueSchedule,
  Booking,
  VenueRating,
  UserSportsSkill,
  UserAvailability,
  UserProfilePhoto,
  UserSwipe,
  UserMatch,
  Gametime,
  GametimeParticipant,
  Conversation,
  Message,
  Coach,
  CoachAvailability,
  CoachingSession,
  CoachRating,
  UserStats,
  GameHistory,
  PlayerRating,
  Event,
  EventRegistration,
  Achievement,
  UserAchievement,
  sequelize,
};

export default models;
export {
  User,
  Venue,
  VenueSport,
  VenueImage,
  VenueSchedule,
  Booking,
  VenueRating,
  UserSportsSkill,
  UserAvailability,
  UserProfilePhoto,
  UserSwipe,
  UserMatch,
  Gametime,
  GametimeParticipant,
  Conversation,
  Message,
  Coach,
  CoachAvailability,
  CoachingSession,
  CoachRating,
  UserStats,
  GameHistory,
  PlayerRating,
  Event,
  EventRegistration,
  Achievement,
  UserAchievement,
};
