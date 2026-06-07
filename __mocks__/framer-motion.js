/**
 * __mocks__/framer-motion.js
 *
 * Plain-JS stub for framer-motion. Replaces animation-heavy components
 * with lightweight pass-through equivalents so jsdom tests don't need a DOM
 * animation engine.
 */
const React = require('react');

// Build a Proxy that returns a forwarded-ref component for any HTML tag.
// e.g. motion.div, motion.button, motion.svg …
const motion = new Proxy(
  {},
  {
    get(_target, key) {
      const Component = React.forwardRef(function MotionComponent(props, ref) {
        // Strip framer-motion-specific props to avoid unknown DOM attribute warnings
        const {
          animate: _a,
          initial: _i,
          exit: _e,
          transition: _t,
          variants: _v,
          whileHover: _wh,
          whileTap: _wt,
          whileFocus: _wf,
          whileInView: _wiv,
          layout: _l,
          layoutId: _lid,
          drag: _d,
          dragConstraints: _dc,
          dragElastic: _de,
          onAnimationComplete: _oac,
          children,
          ...rest
        } = props;
        return React.createElement(key, { ...rest, ref }, children);
      });
      Component.displayName = 'motion.' + key;
      return Component;
    },
  }
);

// AnimatePresence just renders children
function AnimatePresence({ children }) {
  return React.createElement(React.Fragment, null, children);
}
AnimatePresence.displayName = 'AnimatePresence';

function useAnimation() {
  return { start: jest.fn(), stop: jest.fn(), set: jest.fn() };
}

function useMotionValue(initial) {
  return { get: () => initial, set: jest.fn(), onChange: jest.fn() };
}

function useTransform(_value, _input, output) {
  return { get: () => (output ? output[0] : undefined), set: jest.fn(), onChange: jest.fn() };
}

module.exports = {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
};
