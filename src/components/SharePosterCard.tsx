import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export interface PosterData {
  headline: string;
  subtitle?: string;
  quote: string;
  cta?: string;
  category?: string;
  brand?: string;
  signature?: string;
}

interface SharePosterCardProps {
  imageUri: string;
  poster: PosterData;
}

export function SharePosterCard({ imageUri, poster }: SharePosterCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.headline}>{poster.headline}</Text>
        {poster.subtitle ? <Text style={styles.subtitle}>{poster.subtitle}</Text> : null}
        <Text style={styles.quote}>{poster.quote}</Text>
        {poster.cta ? <Text style={styles.cta}>{poster.cta}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.signature}>{poster.signature ?? 'Seeing with Vision Agent'}</Text>
          <Text style={styles.brand}>{poster.brand ?? 'Vision Agent'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: '#5C4033',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF8F0',
    lineHeight: 30,
  },
  subtitle: {
    ...typography.caption,
    color: 'rgba(255,248,240,0.75)',
  },
  quote: {
    ...typography.body,
    color: '#FFF8F0',
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  cta: {
    ...typography.caption,
    color: 'rgba(255,248,240,0.85)',
    lineHeight: 20,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,240,0.2)',
  },
  signature: {
    ...typography.caption,
    color: 'rgba(255,248,240,0.7)',
    flex: 1,
  },
  brand: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#FFF8F0',
  },
});
