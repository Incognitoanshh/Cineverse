import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import * as movieController from '../controllers/movieController';

const router = Router();

// Public routes
router.get('/', movieController.getMovies);
router.get('/trending', movieController.getTrending);
router.get('/upcoming', movieController.getUpcoming);
router.get('/top-rated', movieController.getTopRated);
router.get('/genres/:genreSlug', movieController.getByGenre);
router.get('/:slug', movieController.getMovie);
router.get('/:slug/cast', movieController.getMovieCast);
router.get('/:slug/crew', movieController.getMovieCrew);
router.get('/:slug/reviews', movieController.getMovieReviews);
router.get('/:slug/similar', movieController.getSimilarMovies);
router.get('/:slug/awards', movieController.getMovieAwards);

// Protected routes
router.post('/:slug/rate', authenticate, movieController.rateMovie);
router.post('/:slug/watchlist', authenticate, movieController.addToWatchlist);
router.delete('/:slug/watchlist', authenticate, movieController.removeFromWatchlist);
router.post('/:slug/favorite', authenticate, movieController.toggleFavorite);

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), movieController.createMovie);
router.put('/:id', authenticate, authorize('ADMIN'), movieController.updateMovie);
router.delete('/:id', authenticate, authorize('ADMIN'), movieController.deleteMovie);

export default router;
