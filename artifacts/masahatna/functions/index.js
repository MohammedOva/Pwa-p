const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()

// Runs on Firebase's servers (this is the "Blaze plan" part) whenever the shared
// couples/main document changes. It looks at the `lastAction` field the app writes
// with every action, and — if it's a genuinely new action — pushes a notification
// to the *other* partner's saved device token.
exports.notifyOnAction = onDocumentUpdated('couples/main', async (event) => {
  const before = event.data.before.data() || {}
  const after = event.data.after.data() || {}

  const lastAction = after.lastAction
  if (!lastAction) {
    console.log('No lastAction on this update — nothing to notify about.')
    return
  }

  // Firestore updates can fire more than once for the same write; only act on a
  // genuinely new action id so the same notification isn't sent twice.
  if (before.lastAction && before.lastAction.id === lastAction.id) {
    console.log('Duplicate trigger for the same action id — skipping:', lastAction.id)
    return
  }

  const recipient = lastAction.by === 'Moe' ? 'Rio' : 'Moe'
  const token = after.tokens && after.tokens[recipient]
  if (!token) {
    console.log(`No saved device token for ${recipient} — that partner hasn't enabled notifications yet.`)
    return
  }

  try {
    const notificationData = {
      title: String(lastAction.title || 'مساحتنا'),
      body: String(lastAction.body || ''),
      actionId: String(lastAction.id),
    }
    const messageId = await getMessaging().send({
      token,
      data: notificationData,
      webpush: {
        data: notificationData,
      },
    })
    console.log(`Notification sent to ${recipient}. Message ID:`, messageId)
  } catch (err) {
    console.error(`Failed to send notification to ${recipient}:`, err)
  }
})
