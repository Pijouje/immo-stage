<script setup>
const props = defineProps({
    modelValue: String,
    placeholder: { type: String, default: '••••••••' },
    label: String,
    id: String,
    required: { type: Boolean, default: false },
    noWrapper: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const visible = ref(false)
</script>

<template>
    <div :class="noWrapper ? '' : 'password-input-group'">
        <label v-if="label && !noWrapper" :for="id">{{ label }}</label>
        <div class="password-wrapper">
            <input 
                :type="visible ? 'text' : 'password'"
                :value="modelValue"
                @input="emit('update:modelValue', $event.target.value)"
                :placeholder="placeholder"
                :id="id"
                :required="required"
            />
            <button 
                type="button" 
                class="toggle-password" 
                @click="visible = !visible"
                tabindex="-1"
            >
                <svg v-if="visible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.password-input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.password-input-group label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #334155;
}

.password-wrapper {
    position: relative;
    width: 100%;
}

.password-wrapper input {
    width: 100%;
    padding: 12px 45px 12px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
}

.password-wrapper input:focus {
    outline: none;
    border-color: #2563EB;
}

.toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: color 0.2s;
    line-height: 0;
}

.toggle-password:hover {
    color: #2563EB;
}

.toggle-password svg {
    display: block;
}
</style>