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
};
