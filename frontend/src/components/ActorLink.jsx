import { useDetail } from '../context/detail';
import { c } from '../theme';

export default function ActorLink({ name, style, color = c.accentHi }) {
  const { openActor } = useDetail();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); openActor(name); }}
      title={`View ${name} threat actor profile`}
      style={{
        background: 'none', border: 'none', padding: 0, margin: 0,
        font: 'inherit', color, cursor: 'pointer',
        borderBottom: `1px dashed ${c.accentLine}`,
        transition: 'color 0.15s', ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = c.accent; }}
      onMouseLeave={e => { e.currentTarget.style.color = color; }}
    >
      {name}
    </button>
  );
}
