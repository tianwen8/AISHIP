import { findUserByEmail, createUser } from "@/models/user";
import { User } from "@/types/user";
import { getUuid } from "@/lib/hash";

// save user to database, if user not exist, create a new user
export async function saveUser(user: User) {
  try {
    if (!user.email) {
      throw new Error("invalid user email");
    }

    const existUser = await findUserByEmail(user.email);

    if (!existUser) {
      // user not exist, create a new user
      if (!user.uuid) {
        user.uuid = getUuid();
      }

      const dbUser = await createUser({
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname || "",
        avatar_url: user.avatar_url || "",
        signin_type: user.signin_type,
        signin_provider: user.signin_provider,
        signin_openid: user.signin_openid,
        signin_ip: user.signin_ip,
      });

      // No automatic credits on signup for now.

      user = {
        uuid: dbUser.uuid,
        email: dbUser.email,
        nickname: dbUser.nickname || "",
        avatar_url: dbUser.avatar_url || "",
        created_at: dbUser.created_at || user.created_at,
      };
    } else {
      // user exist, return user info in db
      user = {
        uuid: existUser.uuid,
        email: existUser.email,
        nickname: existUser.nickname || "",
        avatar_url: existUser.avatar_url || "",
        created_at: existUser.created_at || user.created_at,
      };
    }

    return user;
  } catch (e) {
    console.log("save user failed: ", e);
    throw e;
  }
}
