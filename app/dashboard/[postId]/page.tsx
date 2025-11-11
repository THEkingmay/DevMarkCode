'use client';

import { useParams } from 'next/navigation';

export default function SelectPost() {
  const { postId } = useParams<{ postId: string }>();
  return <div>You select post id : {postId}</div>;
}
