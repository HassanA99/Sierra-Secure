'use client'

import React from 'react'

const mockLogs = [
    { id: '1', action: 'DOCUMENT_MINTED', details: 'Birth Certificate (Solana NFT)', timestamp: '2 mins ago', txHash: '5Kj...9Lm', status: 'CONFIRMED' },
    { id: '2', action: 'AI_VERIFICATION', details: 'Forensic Scan Passed (99.8%)', timestamp: '5 mins ago', txHash: '-', status: 'COMPLETED' },
    { id: '3', action: 'ACCESS_GRANTED', details: 'Shared with Ministry of Health', timestamp: '2 days ago', txHash: '3Xy...7Zn', status: 'ACTIVE' },
    { id: '4', action: 'LOGIN', details: 'Wallet Connect (Phantom)', timestamp: '2 days ago', txHash: '-', status: 'SUCCESS' },
    { id: '5', action: 'DOCUMENT_UPLOADED', details: 'National ID encrypted', timestamp: '1 week ago', txHash: '-', status: 'SUCCESS' },
]

export default function LogsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Audit Logs</h1>
                    <p className="text-foreground-secondary mt-1">Immutable record of all your vault activities</p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm">
                    ⬇ Export CSV
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-xs font-semibold uppercase text-foreground-secondary">Activity</th>
                            <th className="p-4 text-xs font-semibold uppercase text-foreground-secondary">Details</th>
                            <th className="p-4 text-xs font-semibold uppercase text-foreground-secondary">Time</th>
                            <th className="p-4 text-xs font-semibold uppercase text-foreground-secondary">Proof (Tx)</th>
                            <th className="p-4 text-xs font-semibold uppercase text-foreground-secondary">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mockLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium ${log.action === 'DOCUMENT_MINTED' ? 'bg-solana-teal/10 text-solana-teal' :
                                            log.action === 'AI_VERIFICATION' ? 'bg-violet-accent/10 text-violet-accent' :
                                                'bg-white/10 text-foreground-secondary'
                                        }`}>
                                        {log.action.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">{log.details}</td>
                                <td className="p-4 text-sm text-foreground-secondary">{log.timestamp}</td>
                                <td className="p-4">
                                    {log.txHash !== '-' ? (
                                        <a href="#" className="font-mono text-xs text-solana-teal hover:underline flex items-center gap-1">
                                            {log.txHash} ↗
                                        </a>
                                    ) : (
                                        <span className="text-foreground-secondary opacity-30">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm">
                                    {log.status === 'CONFIRMED' || log.status === 'SUCCESS' || log.status === 'COMPLETED' ? (
                                        <span className="text-success">● Done</span>
                                    ) : (
                                        <span className="text-foreground-secondary">{log.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-solana-teal/5 border border-solana-teal/20 flex items-start gap-3">
                <div className="text-xl">🤖</div>
                <div>
                    <p className="text-sm font-bold text-solana-teal">AI Insight</p>
                    <p className="text-sm text-foreground-secondary mt-1">
                        Your identity vault is healthy. No suspicious access attempts detected in the last 30 days.
                        All 3 verified documents are immutable on the Solana mainnet.
                    </p>
                </div>
            </div>
        </div>
    )
}
