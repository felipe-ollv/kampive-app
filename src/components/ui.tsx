import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export function Icon({
  name,
  size = 22,
  color = colors.primary,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
export function T({ className = '', ...props }: TextProps & { className?: string }) {
  return (
    <Text
      {...props}
      className={`${/\bfont-/.test(className) ? '' : 'font-jakarta'} ${/\btext-(?:xs|sm|base|lg|xl|[2-9]xl|\[\d)/.test(className) ? '' : 'text-sm'} ${/\bleading-/.test(className) ? '' : 'leading-[22px]'} ${/\btext-(?:primary|secondary|white|green|red|ink|\[\#)/.test(className) ? '' : 'text-ink'} ${className}`}
    />
  );
}
export function Title({ children }: { children: ReactNode }) {
  return (
    <T
      accessibilityRole="header"
      className="font-display text-[28px] leading-[35px] tracking-tight"
    >
      {children}
    </T>
  );
}
export function Section({ children }: { children: ReactNode }) {
  return (
    <T accessibilityRole="header" className="font-bold text-lg leading-7">
      {children}
    </T>
  );
}
export function IconButton({
  icon,
  label,
  onPress,
  light = false,
  selected,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  light?: boolean;
  selected?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      className={`h-11 w-11 items-center justify-center rounded-full active:opacity-60 ${light ? 'bg-white/95' : 'bg-surface-low'}`}
    >
      <Icon name={icon} color={selected ? colors.secondary : colors.primary} />
    </Pressable>
  );
}
export function Header({ back = false, home = false }: { back?: boolean; home?: boolean }) {
  return (
    <View className="h-16 flex-row items-center justify-between border-b border-line px-5">
      {back ? (
        <IconButton
          icon="arrow-left"
          label="Voltar"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : (
        <View className="w-1" />
      )}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Kampive, início"
        onPress={() => router.navigate('/')}
        className="flex-row items-center gap-2"
      >
        <Icon name="compass" size={27} />
        <T className="font-display text-[23px] tracking-tight">
          Kampive<T className="text-secondary text-[23px]">.</T>
        </T>
      </Pressable>
      {home ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Abrir perfil"
          onPress={() => router.navigate('/profile')}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary-container"
        >
          <Icon name="account-cowboy-hat" size={27} />
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-1 rounded-full bg-primary-container px-2 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-primary" />
          <T className="font-bold text-[9px] text-primary">DEMO</T>
        </View>
      )}
    </View>
  );
}
export function Screen({
  children,
  back = false,
  home = false,
  header = true,
}: {
  children: ReactNode;
  back?: boolean;
  home?: boolean;
  header?: boolean;
}) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {header && <Header back={back} home={home} />}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 44, gap: 24 }}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Badge({
  children,
  icon = 'pine-tree',
  dark = false,
}: {
  children: ReactNode;
  icon?: IconName;
  dark?: boolean;
}) {
  return (
    <View
      className={`self-start flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${dark ? 'bg-primary-dark' : 'bg-primary-container'}`}
    >
      <Icon name={icon} size={13} color={dark ? '#4ade80' : colors.primary} />
      <T
        className={`font-bold text-[10px] leading-4 tracking-[1px] uppercase ${dark ? 'text-green-400' : 'text-primary'}`}
      >
        {children}
      </T>
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  icon = 'arrow-right',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`min-h-14 flex-row items-center justify-center gap-3 rounded-xl px-4 py-3.5 ${secondary ? 'border border-primary bg-transparent' : 'bg-secondary'} ${disabled ? 'opacity-40' : 'active:opacity-80'}`}
    >
      <T className={`shrink font-bold ${secondary ? 'text-primary' : 'text-white'}`}>{title}</T>
      <Icon name={icon} size={20} color={secondary ? colors.primary : '#fff'} />
    </Pressable>
  );
}
export function Field({
  label,
  icon = 'pencil-outline',
  password = false,
  ...props
}: TextInputProps & { label: string; icon?: IconName; password?: boolean }) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <View className="gap-2">
      <T className="font-semibold text-xs">{label}</T>
      <View
        className={`min-h-14 flex-row items-center gap-3 rounded-xl border bg-surface-low px-3.5 ${focus ? 'border-primary' : 'border-line'}`}
      >
        <Icon name={icon} size={20} color={colors.muted} />
        <TextInput
          {...props}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          autoCapitalize={password ? 'none' : props.autoCapitalize}
          secureTextEntry={password && !show}
          className={`min-h-14 min-w-0 flex-1 font-jakarta text-sm text-ink ${props.multiline ? 'py-4' : ''}`}
          style={[props.multiline ? { height: 140, textAlignVertical: 'top' } : {}, props.style]}
        />
        {password && (
          <IconButton
            icon={show ? 'eye-off-outline' : 'eye-outline'}
            label={show ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setShow(!show)}
          />
        )}
      </View>
    </View>
  );
}
export function Chip({
  title,
  selected,
  onPress,
  icon,
}: {
  title: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!selected }}
      className={`min-h-11 flex-row items-center justify-center gap-2 rounded-full border px-4 py-2 ${selected ? 'border-primary bg-primary' : 'border-line bg-surface-low'}`}
    >
      {icon && <Icon name={icon} size={16} color={selected ? '#fff' : colors.primary} />}
      <T className={`font-semibold text-xs ${selected ? 'text-white' : 'text-ink-variant'}`}>
        {title}
      </T>
    </Pressable>
  );
}
export function Check({
  checked,
  onChange,
  children,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onChange}
      hitSlop={compact ? 8 : 0}
      className={`${compact ? 'min-h-7' : 'min-h-11'} flex-row items-center gap-3`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${checked ? 'border-primary bg-primary' : 'border-ink-muted'}`}
      >
        {checked && <Icon name="check" size={15} color="#fff" />}
      </View>
      <T className="flex-1 text-xs text-ink-variant">{children}</T>
    </Pressable>
  );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className={`rounded-xl p-4 ${error ? 'bg-red-50' : 'bg-primary-container/60'}`}
    >
      <T className={`text-xs ${error ? 'text-red-700' : 'text-primary'}`}>{children}</T>
    </View>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: () => void;
}) {
  return (
    <View className="items-center gap-3 rounded-2xl border border-dashed border-line px-5 py-10">
      <Icon name="compass-outline" size={40} color={colors.muted} />
      <Section>{title}</Section>
      <T className="text-center text-ink-variant">{text}</T>
      {action && <Button title="Explorar refúgios" onPress={action} secondary />}
    </View>
  );
}
export function Photo({
  uri,
  className = '',
  style,
}: {
  uri: string;
  className?: string;
  style?: ComponentProps<typeof Image>['style'];
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return (
    <View className={`overflow-hidden bg-primary-container ${className}`} style={style}>
      {failed ? (
        <View className="flex-1 items-center justify-center">
          <Icon name="image-outline" size={36} color={colors.muted} />
          <T className="text-xs text-ink-variant">Imagem indisponível</T>
        </View>
      ) : (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel="Paisagem de camping ilustrativa"
        />
      )}
    </View>
  );
}
