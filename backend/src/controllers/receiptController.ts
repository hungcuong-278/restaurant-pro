/**
 * Receipt Controller
 * Week 7 - Phase 3 - Task 3.6
 * 
 * HTTP handlers for receipt generation
 */

import { Request, Response } from 'express';
import receiptService from '../services/receiptService';
import { createLogger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';

const logger = createLogger('ReceiptController');

/**
 * Generate HTML receipt
 * GET /api/restaurants/:restaurantId/orders/:orderId/receipt
 */
export const generateHTMLReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    logger.info('Generating HTML receipt', { orderId });

    const html = await receiptService.generateHTMLReceipt(orderId);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error: any) {
    logger.error('Failed to generate HTML receipt', { error, orderId: req.params.orderId });

    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message,
    });
  }
};

/**
 * Generate text receipt
 * GET /api/restaurants/:restaurantId/orders/:orderId/receipt/text
 */
export const generateTextReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    logger.info('Generating text receipt', { orderId });

    const text = await receiptService.generateTextReceipt(orderId);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);

  } catch (error: any) {
    logger.error('Failed to generate text receipt', { error, orderId: req.params.orderId });

    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message,
    });
  }
};

/**
 * Get receipt data (JSON)
 * GET /api/restaurants/:restaurantId/orders/:orderId/receipt/data
 */
export const getReceiptData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    logger.info('Getting receipt data', { orderId });

    const data = await receiptService.getReceiptData(orderId);

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {
    logger.error('Failed to get receipt data', { error, orderId: req.params.orderId });

    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get receipt data',
      error: error.message,
    });
  }
};
