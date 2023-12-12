import User from "../models/User.js";
import Post from "../models/Post.js";
export const getUsersBySearch = async (req, res) => {
  try {
    const { searchName } = req.query;
    const name = new RegExp(searchName, "i");
    const users = await User.find({
      $or: [{ firstName: name }, { lastName: name }],
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
/*UPDATE*/
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    //remove friend
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== friendId);
    } else {
      //add

      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const updates = req.body;
    await User.updateOne(
      { _id: id },
      {
        $set: {
          firstName: updates.firstName,
          lastName: updates.lastName,
          picturePath: updates.picturePath,
          location: updates.location,
          occupation: updates.occupation,
        },
      }
    );

    await Post.updateMany(
      { userId: id },
      {
        $set: {
          firstName: updates.firstName,
          lastName: updates.lastName,
          location: updates.location,
          userPicturePath: updates.picturePath,
        },
      }
    );

    const newuser = await User.findById(id);
    return res.status(200).json(newuser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
