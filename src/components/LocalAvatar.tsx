import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

type LocalAvatarProps = {
  storageKey: string
  alt: string
}

const LocalAvatar = ({ storageKey, alt }: LocalAvatarProps) => {
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(() => localStorage.getItem(storageKey))
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (!result) {
        return
      }
      localStorage.setItem(storageKey, result)
      setAvatarDataUrl(result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleRemoveAvatar = () => {
    localStorage.removeItem(storageKey)
    setAvatarDataUrl(null)
  }

  return (
    <div className="profile-avatar-wrap">
      <button type="button" className="profile-avatar-button" onClick={handleAvatarClick} aria-label="上传头像">
        {avatarDataUrl ? (
          <img className="profile-avatar-image" src={avatarDataUrl} alt={alt} />
        ) : (
          <span className="profile-avatar-placeholder" aria-hidden="true" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="profile-avatar-input"
        onChange={handleFileChange}
      />
      {avatarDataUrl ? (
        <button
          type="button"
          className="profile-avatar-remove"
          onClick={handleRemoveAvatar}
          aria-label="移除头像"
          title="移除头像"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}

export default LocalAvatar
