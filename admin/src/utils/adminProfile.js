export const DEFAULT_ADMIN_PROFILE = {
  name: 'Vatsal Kansara',
  email: 'vatsal.kansara@questai.com',
  phone: '+91 98765 43210',
  role: 'Super Admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
};

export const getAdminProfile = () => {
  const saved = sessionStorage.getItem('questai_user') || localStorage.getItem('questai_user');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name || DEFAULT_ADMIN_PROFILE.name,
        email: parsed.email || DEFAULT_ADMIN_PROFILE.email,
        phone: parsed.phone || DEFAULT_ADMIN_PROFILE.phone,
        role: parsed.role || DEFAULT_ADMIN_PROFILE.role,
        avatar: parsed.avatar || DEFAULT_ADMIN_PROFILE.avatar
      };
    } catch (e) {
      console.error('Error parsing questai_user profile', e);
    }
  }
  return DEFAULT_ADMIN_PROFILE;
};

export const saveAdminProfile = (updatedProfile) => {
  const current = getAdminProfile();
  const merged = { ...current, ...updatedProfile };
  sessionStorage.setItem('questai_user', JSON.stringify(merged));
  localStorage.setItem('questai_user', JSON.stringify(merged));
  window.dispatchEvent(new Event('adminProfileChange'));
  return merged;
};
