import React from 'react';
import { SealIcon } from '../assets/CardArt';
import { CheckIcon } from '../assets/Icons';

function DestinySelector({ onSelect, selected, disabled }) {
  const destinies = [
    {
      id: 'simplicidade',
      symbol: 'I',
      name: 'Simplicidade Absoluta',
      target: '1',
      description: 'Busque a essência. Menos pode ser mais.',
      color: '#4a7c28'
    },
    {
      id: 'grandeza',
      symbol: 'XX',
      name: 'Grandeza Suprema',
      target: '20',
      description: 'Alcance o ápice. A grandeza é o ápice do conhecimento.',
      color: '#c9a84c'
    },
    {
      id: 'duplo_juramento',
      symbol: 'I + XX',
      name: 'O Duplo Juramento',
      target: '1 & 20',
      description: 'O mais ousado dos caminhos. Deve vencer ambos.',
      color: '#c44536'
    }
  ];

  const iconMap = {
    simplicidade: 'simplicidade',
    grandeza: 'grandeza',
    duplo_juramento: 'duplo_juramento'
  };

  return (
    <div className="destiny-selector animate-in">
      {destinies.map(destiny => (
        <div
          key={destiny.id}
          className={`destiny-option ${selected === destiny.id ? 'selected' : ''}`}
          onClick={() => !disabled && !selected && onSelect(destiny.id)}
          style={{
            borderColor: selected === destiny.id ? destiny.color : undefined,
            cursor: disabled || selected ? 'not-allowed' : 'pointer'
          }}
        >
          <div className="destiny-symbol" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <SealIcon type={iconMap[destiny.id]} size={64} />
          </div>
          <div className="destiny-name">{destiny.name}</div>
          <div className="destiny-target">≈ {destiny.target}</div>
          <div className="destiny-desc">{destiny.description}</div>
          {selected === destiny.id && (
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#4a8a4a', 
              fontFamily: 'Cinzel',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem'
            }}>
              <CheckIcon size={14} /> Escolhido
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DestinySelector;
