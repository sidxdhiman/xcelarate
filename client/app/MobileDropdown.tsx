import React from 'react';
import { Platform, View } from 'react-native';
import ModalSelector from 'react-native-modal-selector';

interface Props {
    data: { key: number | string; label: string }[];
    initValue: string;
    onChange: (option: { key: number | string; label: string }) => void;
}

const MobileDropdown = ({ data, initValue, onChange }: Props) => {
    if (Platform.OS === 'web') return null;

    // Make sure all keys are strings and unique
    const formattedData = data.map((item, index) => ({
        key: item.key.toString() + '-' + index,
        label: item.label,
    }));

    return (
        <View style={{ width: '100%' }}>
            <ModalSelector
                data={formattedData}
                initValue={initValue}
                onChange={onChange}
                style={{ width: '100%' }}
                selectStyle={{
                    height: 45,
                    borderRadius: 50,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    paddingHorizontal: 15,
                }}
                selectTextStyle={{ color: '#fff', fontSize: 16 }}
                optionTextStyle={{ color: '#000' }}
                cancelText="Cancel"
            />
        </View>
    );
};

export default MobileDropdown;
