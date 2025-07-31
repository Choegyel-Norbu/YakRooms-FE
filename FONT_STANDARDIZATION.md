# Font Standardization Guide

## Overview
This document outlines the font standardization changes implemented to ensure uniform and professional typography throughout the YakRooms application.

## Font Family Configuration

### Tailwind Config (`tailwind.config.js`)
```javascript
fontFamily: {
  'sans': [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    '"Helvetica Neue"',
    'sans-serif'
  ],
  'heading': [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif'
  ],
  'mono': [
    'JetBrains Mono',
    'Consolas',
    'monospace'
  ],
}
```

### CSS Variables (`src/index.css`)
```css
--font-family-primary: system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
--font-family-heading: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-mono: "JetBrains Mono", Consolas, monospace;
```

## Font Usage Standards

### 1. Base Font
- **Default**: `font-sans` for all body text and general content
- **Applied globally**: Set in `body` element in `src/index.css`

### 2. Headings
- **Font Family**: `font-heading` (Inter)
- **Weights**: 
  - `font-semibold` (600) for most headings
  - `font-bold` (700) for primary headings only
- **Applied automatically**: All `h1`, `h2`, `h3`, `h4`, `h5`, `h6` elements

### 3. Font Weights Standardization
```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

## Component-Specific Changes

### 1. Navbar Component (`src/components/Navbar.jsx`)
- **Logo**: Changed from `font-sans` to `font-heading` for YakRooms text
- **Consistent font weights**: Standardized to `font-semibold` for headings

### 2. About Page (`src/pages/About.jsx`)
- **Container**: Changed from `font-inter` to `font-sans`
- **Headings**: Standardized to `font-semibold`
- **Text sizes**: Normalized to standard Tailwind sizes (`text-base`, `text-xl`)

### 3. Feature Section (`src/components/FeatureSection.jsx`)
- **Main heading**: Changed from `font-bold` to `font-semibold`
- **Card titles**: Changed from `font-bold` to `font-semibold`

### 4. Hero Component (`src/components/hero/HeroLG.jsx`)
- **Main heading**: Changed from `font-bold` to `font-semibold`

### 5. Hotel Listing Page (`src/pages/HotelListingPage.jsx`)
- **Logo component**: Updated font weights from `font-bold` to `font-semibold`
- **Page headings**: Standardized to `font-semibold`

## Typography Hierarchy

### Primary Headings (H1)
- **Font**: `font-heading font-semibold`
- **Size**: `text-4xl` to `text-6xl` (responsive)
- **Use**: Main page titles, hero headings

### Secondary Headings (H2)
- **Font**: `font-heading font-semibold`
- **Size**: `text-2xl` to `text-3xl`
- **Use**: Section titles, card headers

### Tertiary Headings (H3)
- **Font**: `font-heading font-semibold`
- **Size**: `text-xl` to `text-2xl`
- **Use**: Subsection titles, feature titles

### Body Text
- **Font**: `font-sans font-normal`
- **Size**: `text-base` (16px)
- **Use**: Paragraphs, descriptions, general content

### Small Text
- **Font**: `font-sans font-medium`
- **Size**: `text-sm` (14px)
- **Use**: Labels, captions, metadata

### Extra Small Text
- **Font**: `font-sans font-medium`
- **Size**: `text-xs` (12px)
- **Use**: Badges, tags, fine print

## Best Practices

### 1. Font Weight Consistency
- Use `font-semibold` for most headings
- Reserve `font-bold` for primary/hero headings only
- Use `font-medium` for emphasis and labels
- Use `font-normal` for body text

### 2. Font Family Usage
- Use `font-heading` for all headings (h1-h6)
- Use `font-sans` for all body text and UI elements
- Use `font-mono` only for code snippets and technical content

### 3. Text Size Standardization
- Avoid custom text sizes like `text-16`, `text-20`
- Use standard Tailwind sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.

### 4. Responsive Typography
- Use responsive text sizes (e.g., `text-2xl md:text-3xl`)
- Maintain consistent font weights across breakpoints
- Ensure readability on all device sizes

## Implementation Notes

### What Was Changed
1. **Font Families**: Standardized to use defined font stacks
2. **Font Weights**: Reduced overuse of `font-bold`, standardized to `font-semibold`
3. **Text Sizes**: Normalized custom sizes to standard Tailwind sizes
4. **Consistency**: Applied uniform typography across all components

### What Was Preserved
1. **Functionality**: All existing functionality remains intact
2. **Logic**: No business logic was modified
3. **Responsive Design**: All responsive behavior maintained
4. **Accessibility**: Typography improvements enhance readability

### Performance Impact
- Minimal impact on performance
- Uses system fonts for better loading times
- Fallback fonts ensure consistent rendering across platforms

## Future Recommendations

1. **Font Loading**: Consider adding Inter font via Google Fonts for better consistency
2. **Typography Scale**: Implement a more structured typography scale
3. **Dark Mode**: Ensure font weights work well in both light and dark modes
4. **Accessibility**: Regular testing of font contrast ratios

## Files Modified

1. `tailwind.config.js` - Added font family definitions
2. `src/index.css` - Updated base styles and font utilities
3. `src/components/Navbar.jsx` - Standardized logo and navigation typography
4. `src/pages/About.jsx` - Updated page typography
5. `src/components/FeatureSection.jsx` - Standardized feature card typography
6. `src/components/hero/HeroLG.jsx` - Updated hero heading typography
7. `src/pages/HotelListingPage.jsx` - Standardized listing page typography

This standardization ensures a professional, consistent, and readable typography system throughout the YakRooms application. 