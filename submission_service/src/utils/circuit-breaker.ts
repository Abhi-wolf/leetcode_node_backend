import logger from "../config/logger.config";
import { ServiceUnavailableError } from "./errors/app.error";

interface CircuitBreakerOpts {
  failureThreshold: number;
  cooldownMs: number;
  halfOpenMaxAttempts: number;
}

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker {
  private failureThreshold: number;
  private cooldownMs: number;
  private halfOpenMaxAttempts: number;

  private _state: CircuitBreakerState;
  private _failures: number;
  private _lastFailureTime: number;
  private _halfOpenAttempts: number;
  private _halfOpenSuccesses: number;

  constructor(opts: CircuitBreakerOpts) {
    this.failureThreshold = opts.failureThreshold;
    this.cooldownMs = opts.cooldownMs;
    this.halfOpenMaxAttempts = opts.halfOpenMaxAttempts;

    this._state = CircuitBreakerState.CLOSED;
    this._failures = 0;
    this._lastFailureTime = 0;
    this._halfOpenAttempts = 0;
    this._halfOpenSuccesses = 0;
  }

  /**
   * Checks if the cooldown period has elapsed since the last failure.
   * @returns {boolean} True if the cooldown period has elapsed, false otherwise.
   * @private
   */
  _cooldownElapsed() {
    return Date.now() - this._lastFailureTime >= this.cooldownMs;
  }

  /**
   * Transitions the circuit breaker to a new state.
   * @param {CircuitBreakerState} newState - The new state to transition to.
   * @private
   */
  _transitionTo(newState: CircuitBreakerState) {
    const prev = this._state;
    this._state = newState;

    logger.info(`Circuit breaker transitioned from ${prev} => ${newState}`);

    if (newState === CircuitBreakerState.HALF_OPEN) {
      this._halfOpenAttempts = 0;
      this._halfOpenSuccesses = 0;
    }
  }

  /**
   * Opens the circuit, preventing further requests from being allowed until the cooldown period has elapsed. This method is called when the failure threshold is reached or when a test request in the HALF_OPEN state fails.
   * @private
   */
  _openCircuit() {
    this._lastFailureTime = Date.now();
    this._transitionTo(CircuitBreakerState.OPEN);

    logger.info(`Circuit breaker OPEN`, {
      failures: this._failures,
      cooldownMs: this.cooldownMs,
    });
  }

  /**
   * Resets the circuit breaker to the CLOSED state, allowing requests to be processed normally. This method is called when a test request in the HALF_OPEN state succeeds or can be called manually for debugging purposes.
   * @private
   */
  _reset() {
    this._state = CircuitBreakerState.CLOSED;
    this._failures = 0;
    this._halfOpenAttempts = 0;
    this._halfOpenSuccesses = 0;
    logger.info("Circuit breaker HALF_OPEN => CLOSED");
  }

  /**
   * Gets the current state of the circuit breaker.
   * @returns {CircuitState} The current state of the circuit breaker.
   */
  getState() {
    if (this._state === CircuitBreakerState.OPEN && this._cooldownElapsed()) {
      this._transitionTo(CircuitBreakerState.HALF_OPEN);
    }

    return this._state;
  }

  /**
   * Records a successful request.
   * If the circuit breaker is in the HALF_OPEN state, it counts the success and transitions to CLOSED if the required number of successful attempts is reached. If the circuit breaker is in the CLOSED state and there were previous failures, it resets the failure count.
   * @returns {void}
   */
  onSuccess() {
    if (this._state === CircuitBreakerState.HALF_OPEN) {
      this._halfOpenSuccesses++;
      if (this._halfOpenSuccesses >= this.halfOpenMaxAttempts) {
        this._reset();
      }

      return;
    }

    if (this._failures > 0) {
      this._failures = 0; // reset the failure after success
    }
  }

  /**
   * Records a failed request. If the circuit breaker is in the HALF_OPEN state, it immediately transitions back to OPEN. If the circuit breaker is in the CLOSED state, it increments the failure count and opens the circuit if the failure threshold is reached.
   * @returns
   */
  onFailure() {
    // if a failure occurs in HALF_OPEN state, transition back to OPEN state
    if (this._state === CircuitBreakerState.HALF_OPEN) {
      this._openCircuit();
      return;
    }

    this._failures++;
    this._lastFailureTime = Date.now();

    if (this._failures >= this.failureThreshold) {
      this._openCircuit();
    }
  }

  /**
   * Returns a snapshot of the current state of the circuit breaker.
   * @returns {{state: string, failures: number, lastFailureTime: number, halfOpenAttempts: number, halfOpenSuccesses: number, cooldownMs: number, failureThreshold: number}} The snapshot of the circuit breaker state.
   * @private
   */
  snapshot() {
    return {
      state: this._state,
      failures: this._failures,
      lastFailureTime: this._lastFailureTime,
      halfOpenAttempts: this._halfOpenAttempts,
      halfOpenSuccesses: this._halfOpenSuccesses,
      cooldownMs: this.cooldownMs,
      failureThreshold: this.failureThreshold,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === CircuitBreakerState.OPEN) {
      throw new ServiceUnavailableError("Service is temporarily unavailable");
    }

    if (state === CircuitBreakerState.HALF_OPEN) {
      if (this._halfOpenAttempts >= this.halfOpenMaxAttempts) {
        throw new ServiceUnavailableError("Service is temporarily unavailable");
      }

      this._halfOpenAttempts++;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure();
      throw error;
    }
  }
}
