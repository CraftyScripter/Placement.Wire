import { describe, it, expect } from 'vitest';
import { generatePlacementId } from '@/lib/parser/id-generator';

describe('Deterministic Placement ID Generator', () => {
  it('should generate consistent ID for the same Gmail message ID', () => {
    const msgId = '189abc123def456';
    const id1 = generatePlacementId(msgId);
    const id2 = generatePlacementId(msgId);

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^gmail_msg_[a-f0-9]{16}$/);
  });

  it('should generate distinct IDs for different message IDs', () => {
    const id1 = generatePlacementId('msg_1');
    const id2 = generatePlacementId('msg_2');

    expect(id1).not.toBe(id2);
  });

  it('should throw when empty string is provided', () => {
    expect(() => generatePlacementId('')).toThrow();
  });
});
