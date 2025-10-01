// client/components/MobileDropdown.tsx
import React from 'react';
import { Platform } from 'react-native';
import ModalSelector from 'react-native-modal-selector';

interface Props {
    data: { key: number | string; label: string }[];
    initValue: string;
    onChange: (option: { key: number | string; label: string }) => void;
}

const MobileDropdown = (props: Props) => {
    if (Platform.OS === 'web') return null; // never render on web

    return (
        <ModalSelector
            data={props.data}
            initValue={props.initValue}
            onChange={props.onChange}
            style={{ width: '100%' }}
            selectStyle={{ height: 45, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', paddingHorizontal: 15 }}
            selectTextStyle={{ color: '#fff', fontSize: 16 }}
            optionTextStyle={{ color: '#000' }}
            cancelText="Cancel"
        />
    );
};

export default MobileDropdown;
