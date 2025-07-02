import { UserResponse } from "../types/UserResponse";

let _setUser: ((u: UserResponse | null) => void) | null = null;

/**
 * Registers a setter function that can be used to update the global user state.
 * 
 * @function registerUserSetter
 * @param {Function} fn - The setter function that takes a `UserResponse` or `null` as an argument. 
 * This function will be called to update the global user state.
 */
export const registerUserSetter = (fn: (u: UserResponse | null) => void) => {
  _setUser = fn;
};

/**
 * Sets the global user state by calling the registered setter function.
 * 
 * @function setGlobalUserHandler
 * @param {UserResponse | null} user - The user data to set in the global state, or `null` to clear the user state.
 * @throws {Error} If the setter function has not been registered before calling this function.
 */
export const setGlobalUserHandler = (user: UserResponse | null) => {
  if (_setUser) _setUser(user);
};
