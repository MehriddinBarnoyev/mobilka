import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import {COLORS} from '../../constants/theme';

interface NumericKeypadProps {
  onNumberPress: (digit: string) => void
  onBackspace: () => void
  onClearLongPress: () => void
  disabled?: boolean
  canBackspace?: boolean
}

const KEYPAD_LAYOUT = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
]

export function NumericKeypad({
                                onNumberPress,
                                onBackspace,
                                onClearLongPress,
                                disabled = false,
                                canBackspace = true,
                              }: NumericKeypadProps) {
  return (
    <View style={styles.container}>
      {KEYPAD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, colIndex) => {
            if (key === "") {
              return <View key={`empty-${colIndex}`} style={styles.button} />
            }

            if (key === "⌫") {
              return (
                <TouchableOpacity
                  key="backspace"
                  onPress={onBackspace}
                  onLongPress={onClearLongPress}
                  delayLongPress={250}
                  style={[styles.button, (disabled || !canBackspace) && styles.buttonDisabled]}
                  disabled={disabled || !canBackspace}
                  accessibilityLabel="Backspace"
                  accessibilityHint="Delete the last digit"
                >
                  <Text style={styles.iconText}>⌫</Text>
                </TouchableOpacity>
              )
            }

            return (
              <TouchableOpacity
                key={key}
                onPress={() => onNumberPress(key)}
                style={[styles.button, disabled && styles.buttonDisabled]}
                disabled={disabled}
                accessibilityLabel={`Raqam ${key}`}
              >
                <Text style={styles.numberText}>{key}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.KEYPAD_BG,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  numberText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  iconText: {
    fontSize: 22,
    color: COLORS.primary,
  },
})
