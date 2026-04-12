import { useState, useCallback } from 'react'

export default function useFormValidation(schema) {
  const [errors, setErrors] = useState({})

  const validate = useCallback(
    (values) => {
      const newErrors = {}
      for (const [field, validator] of Object.entries(schema)) {
        const error = validator(values[field])
        if (error) newErrors[field] = error
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [schema],
  )

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return { errors, validate, clearError }
}
