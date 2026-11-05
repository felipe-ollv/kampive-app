import { useTranslation } from '../lib/i18n';
import { Modal, View } from 'react-native';
import { Button, Icon, Section, T } from './ui';
export function Dialog({
  title,
  text,
  onClose,
}: {
  title: string;
  text: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          accessibilityViewIsModal
          className="w-full max-w-[440px] gap-5 rounded-3xl bg-surface p-6"
        >
          <Icon name="compass-outline" size={36} />
          <Section>{title}</Section>
          <T className="text-ink-variant">{text}</T>
          <Button title={t('Entendi')} icon="check" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
