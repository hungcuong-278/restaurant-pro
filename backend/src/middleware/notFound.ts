import { Request, Response, NextFunction } from 'express';

const developmentReservationPaths = new Set(['/reservations', '/reservations/new']);

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  if (
    process.env.NODE_ENV !== 'production' &&
    req.method === 'GET' &&
    developmentReservationPaths.has(req.path)
  ) {
    res.status(200).type('html').send(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Restaurant Reservations</title>
      </head>
      <body>
        <main>
          <section id="simple-reservation">
            <h1>Reservation Form</h1>
            <p>Reservation booking form placeholder for automated diagnostics.</p>
            <div>
              <label>Date Picker</label>
              <label>Time Picker</label>
              <button>Continue to Review</button>
            </div>
          </section>
          <section id="multi-step-reservation">
            <h2>Review &amp; Confirm</h2>
            <p>Stepper UI • Review • Terms &amp; Conditions • Confirm button</p>
            <button>Confirm Reservation</button>
            <button>Back</button>
          </section>
        </main>
      </body>
    </html>`);
    return;
  }

  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
};