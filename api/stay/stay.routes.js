import express from 'express'
import { requireAuth, requireAdmin, requireHost } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getStays, getStayById, addStay, updateStay, removeStay, addStayMsg, removeStayMsg } from './stay.controller.js'

export const stayRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

stayRoutes.get('/', log, getStays)
stayRoutes.get('/:id', getStayById)
stayRoutes.post('/', requireAuth, addStay)
stayRoutes.put('/:id', requireAuth, updateStay)
// stayRoutes.delete('/:id', requireAuth, removeStay)
stayRoutes.delete('/:id', requireAuth, requireHost, removeStay)

stayRoutes.post('/:id/msg', requireAuth, addStayMsg)
stayRoutes.delete('/:id/msg/:msgId', requireAuth, removeStayMsg)