/**
 * Postmark — postal cancellation stamp motif.
 * Used for tone labels throughout the app.
 *
 * Props:
 *   tone: 'formal' | 'friendly' | 'concise' | 'persuasive'
 *   size: 'sm' (inline pill) | 'md' (circular stamp, default)
 *   rotate: number (degrees, default 0)
 */
export default function Postmark({ tone = 'formal', size = 'sm', rotate = 0 }) {
  const label = tone.charAt(0).toUpperCase() + tone.slice(1);

  if (size === 'md') {
    return (
      <span
        className={`postmark tone-${tone}`}
        style={{ transform: `rotate(${rotate}deg)` }}
        aria-label={`Tone: ${label}`}
      >
        <span className="postmark-ring" />
        <span className="postmark-inner-ring" />
        <span className="postmark-label">{label}</span>
      </span>
    );
  }

  // Default: inline pill
  return (
    <span
      className={`postmark-inline tone-${tone}`}
      aria-label={`Tone: ${label}`}
    >
      {label}
    </span>
  );
}
