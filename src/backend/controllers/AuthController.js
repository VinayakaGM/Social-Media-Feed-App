import { v4 as uuid } from "uuid";
import { Response } from "miragejs";
import { formatDate } from "../utils/authUtils";
const sign = require("jwt-encode");

/**
 * All the routes related to Auth are present here.
 * These are Publicly accessible routes.
 * */

/**
 * This handler handles user signups.
 * send POST Request at /api/auth/signup
 * body contains {firstName, lastName, username, password}
 * */

// export const signupHandler = function (schema, request) {
//   const { username, password, ...rest } = JSON.parse(request.requestBody);
//   try {
//     // check if username already exists
//     const foundUser = schema.users.findBy({ username: username });
//     if (foundUser) {
//       return new Response(
//         422,
//         {},
//         {
//           errors: ["Unprocessable Entity. Username Already Exists."],
//         }
//       );
//     }
//     const _id = uuid();

//     const newUser = {
//       _id,
//       createdAt: formatDate(),
//       updatedAt: formatDate(),
//       username,
//       password,
//       ...rest,
//       followers: [],
//       following: [],
//       bookmarks: [],
//       banner:"",
//       profilePic:"",
//       bio:"",
//       link:""
//     };
//     const createdUser = schema.users.create(newUser);
//     const encodedToken = sign(
//       { _id, username },
//       process.env.REACT_APP_JWT_SECRET
//     );
//     return new Response(201, {}, { createdUser, encodedToken });
//   } catch (error) {
//     return new Response(
//       500,
//       {},
//       {
//         error,
//       }
//     );
//   }
// };

export const signupHandler = function (schema, request) {
  const { username, password, ...rest } = JSON.parse(request.requestBody);
  try {
    // check if username already exists
    const foundUser = schema.users.findBy({ username: username });
    if (foundUser) {
      return new Response(
        422,
        {},
        {
          errors: ["Unprocessable Entity. Username Already Exists."],
        }
      );
    }
    const _id = uuid();

    // Validate required fields
    if (!username || !password) {
      return new Response(
        400,
        {},
        {
          errors: ["Username and password are required"],
        }
      );
    }

    const newUser = {
      _id,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      username,
      password,
      ...rest,
      followers: [],
      following: [],
      bookmarks: [],
      banner:"",
      profilePic:"",
      bio:"",
      link:""
    };
    const createdUser = schema.users.create(newUser);
    
    // Additional check for JWT secret
    if (!process.env.REACT_APP_JWT_SECRET) {
      console.error('JWT Secret is not defined');
      return new Response(
        500,
        {},
        {
          errors: ["Internal Server Error: JWT Secret not configured"],
        }
      );
    }

    const encodedToken = sign(
      { _id, username },
      process.env.REACT_APP_JWT_SECRET
    );
    return new Response(201, {}, { createdUser, encodedToken });
  } catch (error) {
    console.error('Signup Error:', error);
    return new Response(
      500,
      {},
      {
        errors: [error.message || "Internal Server Error"],
      }
    );
  }
};

/**
 * This handler handles user login.
 * send POST Request at /api/auth/login
 * body contains {username, password}
 * */

export const loginHandler = function (schema, request) {
  const { username, password } = JSON.parse(request.requestBody);
  try {
    const foundUser = schema.users.findBy({ username: username });
    if (!foundUser) {
      return new Response(
        404,
        {},
        {
          errors: [
            "The username you entered is not Registered. Not Found error",
          ],
        }
      );
    }
    if (password === foundUser.password) {
      const encodedToken = sign(
        { _id: foundUser._id, username },
        process.env.REACT_APP_JWT_SECRET
      );
      return new Response(200, {}, { foundUser, encodedToken });
    }
    return new Response(
      401,
      {},
      {
        errors: [
          "The credentials you entered are invalid. Unauthorized access error.",
        ],
      }
    );
  } catch (error) {
    return new Response(
      500,
      {},
      {
        error,
      }
    );
  }
};
