import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Search,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Send,
    Filter,
    User
} from 'lucide-react';
import api from '@/api/client';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
    id: number;
    user_email: string;
    user_username: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'closed';
    admin_reply: string;
    created_at: string;
    updated_at: string;
}

export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const { toast } = useToast();

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/support/tickets/');
            const data = response.data;
            setTickets(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleReply = async (ticketId: number) => {
        if (!replyText.trim()) return;
        try {
            await api.patch(`/api/support/tickets/${ticketId}/`, {
                admin_reply: replyText,
                status: 'closed'
            });
            toast({ title: "Success", description: "Reply sent and ticket closed" });
            setReplyingTo(null);
            setReplyText("");
            fetchTickets();
        } catch (error) {
            console.error("Failed to send reply:", error);
            toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.user_username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><AlertCircle className="w-3 h-3 mr-1" /> Open</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
            case 'closed':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Closed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
                    <p className="text-muted-foreground">Manage and respond to student inquiries</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {tickets.filter(t => t.status === 'open').length} Open Tickets
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by subject, email or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'open' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('open')}
                                size="sm"
                                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                            >
                                Open
                            </Button>
                            <Button
                                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('closed')}
                                size="sm"
                                className="text-green-500 border-green-500 hover:bg-green-50"
                            >
                                Closed
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Loading tickets...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No tickets found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <React.Fragment key={ticket.id}>
                                        <TableRow className="hover:bg-accent/5 transition-colors">
                                            <TableCell className="font-mono text-xs">#{ticket.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{ticket.user_username}</span>
                                                    <span className="text-xs text-muted-foreground">{ticket.user_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(replyingTo === ticket.id ? null : ticket.id)}
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                    {ticket.admin_reply ? 'View Reply' : 'Reply'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        {replyingTo === ticket.id && (
                                            <TableRow className="bg-accent/5">
                                                <TableCell colSpan={6} className="p-6">
                                                    <div className="space-y-4 max-w-2xl mx-auto">
                                                        <div className="bg-card p-4 rounded-lg border shadow-sm">
                                                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                                                <User className="w-3 h-3" /> Student Message:
                                                            </p>
                                                            <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                                                        </div>

                                                        {ticket.admin_reply ? (
                                                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                                                <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Admin Reply:
                                                                </p>
                                                                <p className="text-sm whitespace-pre-wrap">{ticket.admin_reply}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-semibold">Your Reply:</Label>
                                                                <Textarea
                                                                    placeholder="Type your response here..."
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    className="min-h-[100px]"
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                                    <Button size="sm" onClick={() => handleReply(ticket.id)}>
                                                                        <Send className="w-3 h-3 mr-1" /> Send & Close
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
