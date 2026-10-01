import { useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { symbols } from '../data/symbols';
import { stitchImages } from '../data/stitch-images';
import { Photo, T } from './ui';
export const C = {
  primary: '#07241a',
  forest: '#1e3a2f',
  secondary: '#a23f0f',
  orange: '#fe8450',
  surface: '#fbf9f4',
  low: '#f5f3ee',
  container: '#f0eee9',
  high: '#eae8e3',
  line: '#e4e2dd',
  outline: '#727974',
  border: '#c1c8c3',
  text: '#1b1c19',
  variant: '#424844',
  mint: '#caeada',
  peach: '#ffdbce',
};
export type SymbolName = keyof typeof symbols;
export const cardShadow: ViewStyle = {
  shadowColor: C.forest,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 5,
  elevation: 2,
};
export function SIcon({
  name,
  size = 24,
  color = C.primary,
}: {
  name: SymbolName;
  size?: number;
  color?: string;
}) {
  return (
    <Text
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        fontFamily: 'MaterialSymbols',
        fontSize: size,
        lineHeight: size,
        color,
        width: size,
        height: size,
        textAlign: 'center',
        includeFontPadding: false,
      }}
    >
      {symbols[name]}
    </Text>
  );
}
export function Back({ close = false }: { close?: boolean }) {
  return (
    <RoundButton
      icon={close ? 'close' : 'arrow_back'}
      label={close ? 'Fechar' : 'Voltar'}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  );
}
export function RoundButton({
  icon,
  label,
  onPress,
  size = 40,
  background = C.container,
  color = C.primary,
}: {
  icon: SymbolName;
  label: string;
  onPress: () => void;
  size?: number;
  background?: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SIcon name={icon} color={color} size={22} />
    </Pressable>
  );
}
export function Brand({ large = false, filled = false }: { large?: boolean; filled?: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        style={
          filled
            ? {
                width: 30,
                height: 30,
                borderRadius: 14,
                backgroundColor: C.forest,
                alignItems: 'center',
                justifyContent: 'center',
              }
            : undefined
        }
      >
        <SIcon name="explore" color={filled ? '#fff' : C.primary} size={filled ? 20 : 24} />
      </View>
      <T
        className={`font-display tracking-tight text-primary ${large ? 'text-[30px] leading-[36px]' : 'text-[20px] leading-5'}`}
      >
        Kampive
      </T>
    </View>
  );
}
export function TopBar({
  mode = 'profile',
  country = 'Brasil',
  onCountry,
}: {
  mode?: 'home' | 'profile' | 'login' | 'register';
  country?: string;
  onCountry?: () => void;
}) {
  if (mode === 'login')
    return (
      <View className="h-18 flex-row items-center justify-between">
        {/* <Back /> */}
        <Brand filled />
        <View className="flex-row items-center gap-1 rounded-full bg-surface-low px-2.5 py-1">
          {/* <View className="h-2 w-2 rounded-full bg-secondary" /> */}
          {/* <T className="font-semibold text-[10px] leading-3 text-ink-variant">Online</T> */}
        </View>
      </View>
    );
  if (mode === 'register')
    return (
      <View className="h-16 flex-row items-center justify-between border-b border-line/50 px-4">
        <Back />
        <Brand />
        <View className="mr-3 h-2.5 w-2.5 rounded-full bg-secondary" />
      </View>
    );
  return (
    <View className="h-16 flex-row items-center justify-between border-b border-line/50 bg-surface px-4">
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Kampive, início"
        onPress={() => router.navigate('/')}
        className="flex-row items-center gap-3"
      >
        <View className="h-10 w-7 items-center justify-center">
          <SIcon name="explore" size={22} />
        </View>
        <View>
          <T className="font-display text-[30px] leading-8 tracking-tight text-primary">Kampive</T>
          {mode === 'home' && (
            <T className="font-bold text-[10px] leading-3 tracking-[0.4px] text-ink-variant">
              Encontrar. Acampar. Viver.
            </T>
          )}
        </View>
      </Pressable>
      <View className="flex-row items-center gap-2">
        {mode === 'home' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Selecionar país"
            onPress={onCountry}
            className="flex-row items-center gap-1.5 rounded-full border border-[#c1c8c3] bg-surface-container px-3 py-1.5"
          >
            <T className="text-xs">{country === 'Brasil' ? '🇧🇷' : '🌎'}</T>
            <T className="font-bold text-xs text-primary">{country}</T>
            <SIcon name="expand_more" size={14} />
          </Pressable>
        )}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Abrir perfil"
          onPress={() => router.navigate('/profile')}
          className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary p-0.5"
        >
          <Photo uri={stitchImages.home[0]} className="h-full w-full rounded-full" />
        </Pressable>
      </View>
    </View>
  );
}
export function Page({
  children,
  header,
  dock,
  padding = 16,
  gap = 24,
  top = 24,
  texture = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  dock?: ReactNode;
  padding?: number;
  gap?: number;
  top?: number;
  texture?: boolean;
}) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-surface">
      {texture && <Topography />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {header}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: padding,
            paddingTop: top,
            paddingBottom: dock ? 36 : 32,
            gap,
          }}
        >
          {children}
        </ScrollView>
        {dock && <Dock>{dock}</Dock>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Dock({ children }: { children: ReactNode }) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className="gap-2 bg-surface px-4 pt-3"
      style={{
        paddingBottom: Math.max(bottom, 12),
        shadowColor: '#111c16',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      {children}
    </View>
  );
}
export function Pill({
  children,
  icon,
  color = C.forest,
  background = C.container,
}: {
  children: ReactNode;
  icon?: SymbolName;
  color?: string;
  background?: string;
}) {
  return (
    <View
      className="self-start flex-row items-center gap-1.5 rounded-full px-3 py-1"
      style={{ backgroundColor: background }}
    >
      {icon && <SIcon name={icon} size={14} color={color} />}
      <T className="font-semibold text-xs leading-4" style={{ color }}>
        {children}
      </T>
    </View>
  );
}
export function CTA({
  title,
  onPress,
  icon = 'arrow_forward',
  outline = false,
  color = C.secondary,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  icon?: SymbolName;
  outline?: boolean;
  color?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-full px-5 ${compact ? 'min-h-9 py-2' : 'min-h-12 py-3'}`}
      style={{
        backgroundColor: outline ? 'transparent' : color,
        borderWidth: outline ? 1 : 0,
        borderColor: C.primary,
        ...(outline ? {} : cardShadow),
      }}
    >
      {icon !== 'arrow_forward' && (
        <SIcon name={icon} size={compact ? 16 : 20} color={outline ? C.primary : '#fff'} />
      )}
      <T
        className={`shrink text-center font-bold ${compact ? 'text-xs leading-4' : 'text-sm leading-[18px]'}`}
        style={{ color: outline ? C.primary : '#fff' }}
      >
        {title}
      </T>
      {icon === 'arrow_forward' && (
        <SIcon name={icon} size={compact ? 16 : 20} color={outline ? C.primary : '#fff'} />
      )}
    </Pressable>
  );
}
export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View className={`gap-3 rounded-xl bg-white p-4 ${className}`} style={cardShadow}>
      {children}
    </View>
  );
}
export function Heading({
  children,
  icon,
  size = 18,
}: {
  children: ReactNode;
  icon?: SymbolName;
  size?: number;
}) {
  return (
    <View className="flex-row items-center gap-2">
      {icon && <SIcon name={icon} size={22} color={C.secondary} />}
      <T
        accessibilityRole="header"
        className="shrink font-semibold text-primary"
        style={{ fontSize: size, lineHeight: size + 6 }}
      >
        {children}
      </T>
    </View>
  );
}
export function Input({
  label,
  icon,
  password = false,
  hint,
  ...props
}: TextInputProps & { label?: string; icon?: SymbolName; password?: boolean; hint?: string }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-1.5">
      {label && (
        <View className="flex-row justify-between">
          <T className="font-medium text-xs leading-4 text-primary">{label}</T>
          {hint && <T className="text-xs leading-4 text-ink-muted">{hint}</T>}
        </View>
      )}
      <View
        className="min-h-12 flex-row items-center gap-3 rounded-lg bg-surface-container px-3.5"
        style={{ borderWidth: 1, borderColor: focused ? C.forest : 'transparent' }}
      >
        {icon && <SIcon name={icon} size={21} color={C.outline} />}
        <TextInput
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={props.accessibilityLabel || label}
          placeholderTextColor={C.outline}
          secureTextEntry={password && !show}
          autoCapitalize={password ? 'none' : props.autoCapitalize}
          className="min-h-12 min-w-0 flex-1 font-jakarta text-sm leading-5 text-ink"
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={show ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={12}
            onPress={() => setShow(!show)}
          >
            <SIcon name={show ? 'visibility_off' : 'visibility'} size={22} color={C.outline} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
export function ToggleChip({
  children,
  icon,
  selected,
  onPress,
}: {
  children: ReactNode;
  icon: SymbolName;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className="min-h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 py-2"
      style={{
        backgroundColor: selected ? C.forest : C.container,
        borderColor: selected ? C.primary : C.border,
      }}
    >
      <SIcon name={icon} size={16} color={selected ? '#fff' : C.primary} />
      <T className="font-semibold text-xs leading-4" style={{ color: selected ? '#fff' : C.text }}>
        {children}
      </T>
    </Pressable>
  );
}
export function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 14.7l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
      <Path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 14.7l5.7-5.7A20 20 0 0 0 6.3 14.7Z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44Z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </Svg>
  );
}
function Topography() {
  return (
    <View pointerEvents="none" className="absolute inset-0 opacity-[0.035]">
      <Svg width="100%" height="100%">
        <Path
          d="M0 28 Q30 8 62 27 T135 25 T220 28 T300 27 T400 30 M0 60 Q50 40 80 58 T150 62 T250 57 T400 60 M0 92 Q35 108 74 90 T158 100 T235 93 T330 100 T400 90 M0 153 Q40 140 80 156 T160 149 T270 156 T400 153 M0 194 Q40 170 80 194 T160 186 T260 195 T400 192 M0 245 Q30 263 70 244 T160 251 T250 247 T400 256 M0 298 Q40 285 80 299 T160 290 T250 299 T400 293 M0 352 Q30 337 80 355 T160 345 T250 349 T400 355 M0 410 Q40 423 80 408 T160 415 T250 410 T400 414 M0 456 Q40 439 80 456 T160 447 T250 455 T400 448 M0 516 Q40 530 80 512 T160 522 T250 516 T400 523 M0 573 Q40 558 80 571 T160 564 T250 575 T400 569 M0 634 Q40 615 80 633 T160 624 T250 634 T400 627 M0 691 Q40 704 80 691 T160 702 T250 692 T400 700 M0 751 Q40 736 80 751 T160 743 T250 750 T400 744 M0 804 Q40 818 80 802 T160 813 T250 805 T400 809"
          fill="none"
          stroke={C.forest}
          strokeWidth="1.4"
        />
      </Svg>
    </View>
  );
}
