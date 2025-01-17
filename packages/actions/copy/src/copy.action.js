import { copyToClipboard } from './copy.helpers.js';

/**
 * Copy text to clipboard on `click` event
 * @public
 *
 * @template {keyof HTMLElementEventMap} K
 * @param {HTMLElement} node - HTMLElement to register action
 * @param {import('./public.js').CopyParameter<K>} parameter - svelte action parameters
 * @returns {import('./public.js').CopyReturn<K>}
 */
export function copy(node, parameter = {}) {
  let { trigger, enabled, text, events, synthetic } = resolveConfig(node, parameter);

  /** @param {HTMLElementEventMap[K]} e */
  async function handler(e) {
    const rText = await text({ node, trigger, event: e });
    copyToClipboard(rText);
    /** @type {import('./public').CopyDetail} */
    const detail = { text: rText };
    node.dispatchEvent(new CustomEvent('copied', { detail }));
    if (synthetic) {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', rText);
      const event = new ClipboardEvent(
        'copy',
        /** @type {any} */ ({
          clipboardData: clipboardData,
          dataType: 'text/plain',
          data: rText,
        }),
      );
      node.dispatchEvent(event);
    }
  }

  function addEvents() {
    if (trigger) {
      for (const event of events) {
        trigger.addEventListener(/** @type {K} */ (event), handler);
      }
    }
  }

  function removeEvents() {
    if (trigger) {
      for (const event of events) {
        trigger.removeEventListener(/** @type {K} */ (event), handler);
      }
    }
  }

  if (enabled) addEvents();

  return {
    update(update = {}) {
      removeEvents();
      ({ trigger, enabled, text, events, synthetic } = resolveConfig(node, update));
      addEvents();
    },
    destroy() {
      removeEvents();
    },
  };
}

/**
 * @internal
 * @template {keyof HTMLElementEventMap} K
 * @param {HTMLElement} node
 * @param {import('./public').CopyParameter<K>} param
 */
function resolveConfig(node, param = {}) {
  const { trigger = node, enabled = true, synthetic = false } = param;
  const text =
    typeof param.text === 'function'
      ? param.text
      : /** @type {import('./public.js').TextResolver<K>} */ (() => param.text ?? node.innerText);
  const events = typeof param.event === 'string' ? [param.event] : param.event ?? ['click'];
  return { trigger, enabled, text, events, synthetic };
}

/**
 * Deprecated, use `CopyParameter` and `CopyConfig` instead
 * @typedef {import('./public').CopyConfig<K>} CopyParameters
 * @template {keyof HTMLElementEventMap} K
 */
