import React from 'react';
import type { PropertyColor } from '../types';
import { PROPERTY_COLORS_DISPLAY } from '../types';

interface ColorPickerModalProps {
  availableColors: PropertyColor[];
  onSelectColor: (color: PropertyColor) => void;
  onCancel: () => void;
  title?: string;
}

const COLOR_LABELS: Record<PropertyColor, string> = {
  brown: 'Brown',
  lightBlue: 'Light Blue',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Dark Blue',
  railroad: 'Railroad',
  utility: 'Utility',
};

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  availableColors,
  onSelectColor,
  onCancel,
  title = 'Choose a Color',
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-content">
          <div className="color-picker">
            {availableColors.map((color) => (
              <div
                key={color}
                className="color-option"
                style={{ backgroundColor: PROPERTY_COLORS_DISPLAY[color] }}
                onClick={() => onSelectColor(color)}
                title={COLOR_LABELS[color]}
              />
            ))}
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
