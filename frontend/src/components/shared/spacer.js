import React from 'react'

export default function Spacer(props) {
  const margin = props?.margin || '0px';
  return (
    <div style={{margin}}/>
  )
}
