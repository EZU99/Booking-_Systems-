import express from 'express';

 import {
  addMovies,
   getManualMovies, getManualMovieById }
    from '../controllers/moviesController.js';

import { protectAdmin } from '../middleware/auth.js';

const showRouterAddAdmin = express.Router();


showRouterAddAdmin.post("/manual/add",protectAdmin, addMovies);
showRouterAddAdmin.get("/manual/all", getManualMovies);
showRouterAddAdmin.get("/manual/:id", getManualMovieById);



export default showRouterAddAdmin;
