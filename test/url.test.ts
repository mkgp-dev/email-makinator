import { describe, expect, test } from 'vitest';
import { joinUrl } from '../src/shared/utils/url';

describe('joinUrl', () => {
  test('joins base without trailing slash', () => {
    expect(joinUrl('http://localhost:3000', '/v1/ai/generate')).toBe(
      'http://localhost:3000/v1/ai/generate',
    );
  });

  test('joins base with trailing slash', () => {
    expect(joinUrl('http://localhost:3000/', '/v1/ai/generate')).toBe(
      'http://localhost:3000/v1/ai/generate',
    );
  });

  test('joins path without leading slash', () => {
    expect(joinUrl('http://localhost:3000', 'v1/ai/generate')).toBe(
      'http://localhost:3000/v1/ai/generate',
    );
  });
});
