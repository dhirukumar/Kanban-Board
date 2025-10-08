
'use client';

export default function UserAvatar({ user }) {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-yellow-500 to-yellow-700',
  ];

  const colorIndex = user.id.charCodeAt(0) % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Assigned to ${user.name}`}>
      <div
        className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}
        aria-hidden="true"
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="text-xs text-gray-700">{user.name}</span>
    </div>
  );
}