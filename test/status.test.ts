import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PaymentStatus,
  PayoutStatus,
  isPaymentStatusFinal,
  isPaymentStatusSuccessful,
  isPayoutStatusFinal,
  isPayoutStatusSuccessful,
} from '../src/status.js';

describe('PaymentStatus', () => {
  it('classifies final vs intermediate', () => {
    assert.equal(isPaymentStatusFinal(PaymentStatus.Paid), true);
    assert.equal(isPaymentStatusFinal(PaymentStatus.PaidOver), true);
    assert.equal(isPaymentStatusFinal(PaymentStatus.WrongAmount), true);
    assert.equal(isPaymentStatusFinal(PaymentStatus.Check), false);
    assert.equal(isPaymentStatusFinal(PaymentStatus.ConfirmCheck), false);
    assert.equal(isPaymentStatusFinal(PaymentStatus.WrongAmountWaiting), false);
  });

  it('classifies successful payments', () => {
    assert.equal(isPaymentStatusSuccessful(PaymentStatus.Paid), true);
    assert.equal(isPaymentStatusSuccessful(PaymentStatus.PaidOver), true);
    assert.equal(isPaymentStatusSuccessful(PaymentStatus.WrongAmount), false);
    assert.equal(isPaymentStatusSuccessful(PaymentStatus.Fail), false);
  });
});

describe('PayoutStatus', () => {
  it('classifies final vs intermediate', () => {
    assert.equal(isPayoutStatusFinal(PayoutStatus.Paid), true);
    assert.equal(isPayoutStatusFinal(PayoutStatus.Fail), true);
    assert.equal(isPayoutStatusFinal(PayoutStatus.Process), false);
    assert.equal(isPayoutStatusFinal(PayoutStatus.Check), false);
  });

  it('classifies successful payouts', () => {
    assert.equal(isPayoutStatusSuccessful(PayoutStatus.Paid), true);
    assert.equal(isPayoutStatusSuccessful(PayoutStatus.Fail), false);
  });
});
