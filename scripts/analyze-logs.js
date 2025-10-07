// Fetch and analyze Vercel logs to find the error
const response = await fetch(
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logs_result-10-7-25-1pm-YKaAAJCXxUu8SeSSm9jt8E94NM4wBb.csv",
)
const csvText = await response.text()

// Parse CSV
const lines = csvText.split("\n")
const headers = lines[0].split(",")

// Find message column index
const messageIndex = headers.findIndex((h) => h.includes("message"))
const levelIndex = headers.findIndex((h) => h.includes("level"))
const statusIndex = headers.findIndex((h) => h.includes("responseStatusCode"))
const pathIndex = headers.findIndex((h) => h.includes("requestPath"))
const timeIndex = headers.findIndex((h) => h.includes("TimeUTC"))

console.log("[v0] Analyzing Vercel logs...\n")

// Find errors and warnings
const errors = []
const warnings = []

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line.trim()) continue

  const columns = line.split(",")
  const level = columns[levelIndex]?.toLowerCase() || ""
  const status = columns[statusIndex] || ""
  const message = columns[messageIndex] || ""
  const path = columns[pathIndex] || ""
  const time = columns[timeIndex] || ""

  if (level.includes("error") || status === "500") {
    errors.push({ time, path, status, message, level })
  } else if (level.includes("warn")) {
    warnings.push({ time, path, message, level })
  }
}

console.log("[v0] === ERRORS (500 status or error level) ===")
errors.forEach((e) => {
  console.log(`\nTime: ${e.time}`)
  console.log(`Path: ${e.path}`)
  console.log(`Status: ${e.status}`)
  console.log(`Level: ${e.level}`)
  console.log(`Message: ${e.message}`)
})

console.log("\n\n[v0] === WARNINGS ===")
warnings.slice(0, 10).forEach((w) => {
  console.log(`\nTime: ${w.time}`)
  console.log(`Message: ${w.message}`)
})

console.log("\n\n[v0] === SUMMARY ===")
console.log(`Total errors: ${errors.length}`)
console.log(`Total warnings: ${warnings.length}`)
console.log(`Total log entries: ${lines.length - 1}`)

// Look for authentication-related messages
console.log("\n\n[v0] === AUTHENTICATION LOGS ===")
const authLogs = []
for (let i = 1; i < Math.min(lines.length, 100); i++) {
  const line = lines[i]
  const columns = line.split(",")
  const message = columns[messageIndex] || ""

  if (
    message.toLowerCase().includes("auth") ||
    message.toLowerCase().includes("session") ||
    message.toLowerCase().includes("token")
  ) {
    authLogs.push(message)
  }
}

authLogs.slice(0, 20).forEach((msg) => console.log(msg))
