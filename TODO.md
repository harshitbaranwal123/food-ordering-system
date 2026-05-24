# TODO - Smart Ordering UI/UX redesign

## Step 1: Implement Navbar redesign
- [x] Update `food-delivery/frontend/src/components/Navbar/Navbar.jsx`
  - Remove logo image
  - Add styled text logo: Smart (orange) + Ordering (dark)
  - Preserve all existing routing/cart/login/logout logic
- [x] Update `food-delivery/frontend/src/components/Navbar/Navbar.css`
  - Ensure sticky glassmorphism navbar + subtle shadow
  - Keep/upgrade underline hover animation
  - Modern pill-shaped orange sign-in button

## Step 2: Implement Footer redesign
- [x] Update `food-delivery/frontend/src/components/Footer/Footer.jsx`
  - Replace Tomato with Smart Ordering
  - Update email to contact@smartordering.com
  - Update copyright string
  - Remove logo image and use text logo
  - Preserve existing layout
- [x] Update `food-delivery/frontend/src/components/Footer/Footer.css`
  - Modern dark footer spacing/typography
  - Apply general design system styling (radii/shadows/transitions)

## Step 3: Implement Header redesign
- [x] Update `food-delivery/frontend/src/components/Header/Header.jsx`
  - Add badge/tag above heading
  - Update heading + button text remains "View Menu"
- [x] Update `food-delivery/frontend/src/components/Header/Header.css`
  - Full viewport height hero (min-height 100vh)
  - Gradient overlay on background image
  - Big bold modern heading + styled CTA hover animation

## Step 4: Verify
- [x] Run frontend dev/build checks in `food-delivery/frontend` ✅ 0 errors, 171 modules
- [x] Quick manual verification: navbar/footer/header render and no functionality break ✅
