// app/config/index.js
'use strict';


module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "99746510",
};