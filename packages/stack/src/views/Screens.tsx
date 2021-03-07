import * as React from 'react';
import { Animated, View, Platform, ViewProps } from 'react-native';

let Screens: typeof import('react-native-screens') | undefined;

try {
  Screens = require('react-native-screens');
} catch (e) {
  // Ignore
}

export const shouldUseActivityState = Screens?.shouldUseActivityState;

// So we use our custom implementation to handle a11y better
class WebScreen extends React.Component<
  ViewProps & {
    active: number;
    children: React.ReactNode;
  }
> {
  render() {
    const { active, style, ...rest } = this.props;

    return (
      <View
        hidden={!active}
        style={[
          style,
          // @ts-expect-error: contentVisibility is a web specific property
          { display: active ? 'flex' : 'none', contentVisibility: 'auto' },
        ]}
        {...rest}
      />
    );
  }
}

const AnimatedWebScreen = Animated.createAnimatedComponent(WebScreen);

export const MaybeScreenContainer = ({
  enabled,
  ...rest
}: ViewProps & {
  enabled: boolean;
  children: React.ReactNode;
}) => {
  if (enabled && Platform.OS !== 'web' && Screens?.screensEnabled()) {
    return (
      // @ts-ignore
      <Screens.ScreenContainer enabled={enabled} {...rest} />
    );
  }

  return <View {...rest} />;
};

export const MaybeScreen = ({
  enabled,
  active,
  ...rest
}: ViewProps & {
  enabled: boolean;
  active: 0 | 1 | Animated.AnimatedInterpolation;
  children: React.ReactNode;
}) => {
  if (enabled && Platform.OS === 'web') {
    return <AnimatedWebScreen active={active} {...rest} />;
  }

  if (enabled && Screens?.screensEnabled()) {
    if (shouldUseActivityState) {
      return (
        <Screens.Screen enabled={enabled} activityState={active} {...rest} />
      );
    } else {
      return <Screens.Screen enabled={enabled} active={active} {...rest} />;
    }
  }

  return <View {...rest} />;
};
