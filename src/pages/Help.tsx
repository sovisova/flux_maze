import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { Search, Book, FileText, Video, MessageSquare, ExternalLink, Send, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: Book, hasContent: true },
  { id: 'reports', label: 'Reports', icon: FileText, hasContent: true },
  { id: 'integrations', label: 'Integrations', icon: Video, hasContent: false },
  { id: 'api', label: 'API Reference', icon: Book, hasContent: true },
  { id: 'billing', label: 'Billing & Plans', icon: FileText, hasContent: false },
];

const articles = [
  { id: '1', title: 'Creating your first report', category: 'getting-started', readTime: '5 min' },
  { id: '2', title: 'Understanding data sources', category: 'getting-started', readTime: '8 min' },
  { id: '3', title: 'Scheduling automated reports', category: 'reports', readTime: '4 min' },
  { id: '4', title: 'Sharing reports with your team', category: 'reports', readTime: '3 min' },
  { id: '5', title: 'API authentication guide', category: 'api', readTime: '10 min' },
];

export default function Help() {
  const { chatMessages, sendChatMessage } = useAppData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [newMessage, setNewMessage] = useState('');

  const filteredArticles = articles.filter(
    (article) => article.category === selectedCategory && (search ? article.title.includes(search) : true)
  );

  const handleCategoryClick = (categoryId: string, hasContent: boolean) => {
    if (!hasContent) {
      toast({ title: 'No content available', description: 'This section is coming soon.' });
      return;
    }
    setSelectedCategory(categoryId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendChatMessage(newMessage);
    setNewMessage('');
  };

  const handleSupportClick = () => {
    window.open('https://example.com/support', '_blank');
  };

  const handleArticleClick = (article: typeof articles[0]) => {
    toast({ title: 'Opening article', description: `"${article.title}" would open here.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Help & Documentation</h1>
        <p className="text-muted-foreground text-sm">Find answers and get support</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Categories</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => handleCategoryClick(cat.id, cat.hasContent)}
                  className={cn('w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    selectedCategory === cat.id && cat.hasContent ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
                    !cat.hasContent && 'opacity-60')}>
                  <cat.icon className="h-4 w-4" /><span className="text-sm">{cat.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </button>
              ))}
              <div className="pt-4 border-t mt-4">
                <button onClick={handleSupportClick} className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-muted transition-colors">
                  <MessageSquare className="h-4 w-4" /><span className="text-sm">Contact Support</span>
                  <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 search-short w-full" />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">{categories.find((c) => c.id === selectedCategory)?.label}</CardTitle></CardHeader>
            <CardContent>
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8"><p className="text-muted-foreground">No results found.</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <div key={article.id} onClick={() => handleArticleClick(article)} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <div><p className="font-medium text-sm">{article.title}</p><p className="text-xs text-muted-foreground">{article.readTime} read</p></div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" />Chat Support</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={cn('max-w-[80%] p-3 rounded-lg text-sm', msg.type === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted')}>{msg.text}</div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <Button size="icon" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
