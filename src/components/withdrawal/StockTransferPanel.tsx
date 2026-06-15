import { useState, useEffect } from 'react';
import { api, transferStock, getWarehouses } from '@/services/api'; // Ajusta o caminho se necessário
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Loader2, PackageSearch } from "lucide-react";

export const StockTransferPanel = () => {
  // Estados para gerir os dados do formulário
  const [armazens, setArmazens] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]); // Para listar os produtos disponíveis
  
  const [origemId, setOrigemId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [opOrigem, setOpOrigem] = useState('');
  const [opDestino, setOpDestino] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aqui carregamos os armazéns e produtos ao abrir a tela
  useEffect(() => {
    // Nota: Teremos de garantir que estas rotas existem no backend!
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Exemplo: buscar armazéns
        // const whData = await getWarehouses();
        // setArmazens(whData);
        
        // Mock provisório enquanto não fazemos a rota GET de armazéns no backend
        setArmazens([
          { id: 'uuid-almoxarifado', nome: 'Almoxarifado Principal' },
          { id: 'uuid-eletrica', nome: 'Setor Elétrica' },
          { id: 'uuid-3d', nome: 'Produção 3D' }
        ]);

      } catch (error) {
        toast.error("Erro ao carregar dados iniciais.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função principal de envio
  const handleSubmit = async () => {
    if (!origemId || !destinoId || !produtoId || !quantidade) {
      return toast.warning('Preencha os campos obrigatórios (Origem, Destino, Produto e Quantidade).');
    }

    setIsSubmitting(true);
    try {
      await transferStock({
        produtoId: produtoId,
        armazemOrigemId: origemId,
        // Envia as OPs apenas se o utilizador as preencheu
        ...(opOrigem && { opOrigemId: opOrigem }),
        armazemDestinoId: destinoId,
        ...(opDestino && { opDestinoId: opDestino }),
        quantidade: Number(quantidade),
        observacao
      });

      toast.success('Transferência concluída e registada no Kardex!');
      
      // Limpar formulário após sucesso
      setProdutoId('');
      setQuantidade('');
      setObservacao('');
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao processar transferência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#facc15]/20 text-[#facc15] rounded-lg">
          <ArrowRightLeft className="size-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Transferência de Material</h2>
          <p className="text-muted-foreground">Mova stocks entre armazéns ou setores com rastreio por OP.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 bg-card/50 p-6 rounded-xl border border-border/50">
        
        {/* COLUNA: ORIGEM */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-emerald-500 flex items-center gap-2">
            De onde sai?
          </h3>
          
          <div>
            <Label className="mb-2 block">Armazém de Origem</Label>
            <Select onValueChange={setOrigemId} value={origemId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem..." />
              </SelectTrigger>
              <SelectContent>
                {armazens.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">OP de Origem <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
            <Input 
              placeholder="Ex: OP-1234 (Deixe vazio se for stock livre)" 
              value={opOrigem} 
              onChange={(e) => setOpOrigem(e.target.value)} 
            />
          </div>
        </div>

        {/* COLUNA: DESTINO */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-blue-500 flex items-center gap-2">
            Para onde vai?
          </h3>
          
          <div>
            <Label className="mb-2 block">Armazém de Destino</Label>
            <Select onValueChange={setDestinoId} value={destinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o destino..." />
              </SelectTrigger>
              <SelectContent>
                {armazens.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">OP de Destino <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
            <Input 
              placeholder="Ex: OP-9999 (Para alocar a um projeto específico)" 
              value={opDestino} 
              onChange={(e) => setOpDestino(e.target.value)} 
            />
          </div>
        </div>

      </div>

      {/* DADOS DO PRODUTO */}
      <div className="space-y-4 bg-card/50 p-6 rounded-xl border border-border/50">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">ID do Produto (Temporário: cole o UUID)</Label>
            <Input 
              placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000" 
              value={produtoId} 
              onChange={(e) => setProdutoId(e.target.value)} 
            />
            {/* Num próximo passo, podemos trocar este Input por um Select/Combobox com busca! */}
          </div>
          
          <div>
            <Label className="mb-2 block">Quantidade a transferir</Label>
            <Input 
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00" 
              value={quantidade} 
              onChange={(e) => setQuantidade(e.target.value)} 
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Observação (Opcional)</Label>
          <Input 
            placeholder="Ex: Transferido a pedido do João para a máquina X" 
            value={observacao} 
            onChange={(e) => setObservacao(e.target.value)} 
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || isLoading} 
        size="lg" 
        className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#1e1b4b] font-bold text-base"
      >
        {isSubmitting ? <Loader2 className="size-5 mr-2 animate-spin" /> : <ArrowRightLeft className="size-5 mr-2" />}
        Confirmar Transferência
      </Button>

    </div>
  );
};
