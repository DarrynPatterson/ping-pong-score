const User = require("../models/User");

describe("User", () => {
  let randomEmail;

  beforeEach(() => {
    randomEmail = generateRandomEmail();
  });

  test("that a non-existent user is not found", () => {
    User.findOne({ randomEmail }).then(user => {
      expect(user).toBeNull();
    });
  });
});

const generateRandomEmail = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  let string = "";

  for (let i = 0; i < 15; i++) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${string}@domin.com`;
};
