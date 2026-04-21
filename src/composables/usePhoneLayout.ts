import { computed } from 'vue';
import { useDisplay } from 'vuetify';

export function usePhoneLayout() {
  const display = useDisplay();
  const isPhone = computed(() => display.xs.value);
  return { isPhone, display };
}
