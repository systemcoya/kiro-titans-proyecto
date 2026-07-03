import { Tag, AlertTriangle } from 'lucide-react';
import { useResourceTags, useTaggingCompliance } from './hooks/useTagging';

/**
 * Tagging page — Req 11.
 * Resource tagging with business metadata and compliance indicator.
 */
export default function TaggingPage() {
  const tags = useResourceTags();
  const compliance = useTaggingCompliance();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Tag className="h-6 w-6" /> Etiquetado de Recursos
      </h1>

      {/* Compliance gauge */}
      {compliance.data && (
        <div className={`p-4 border rounded-lg flex items-center gap-4 ${
          compliance.data.compliancePercentage < 80 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'
        }`}>
          {compliance.data.compliancePercentage < 80 && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Compliance de Etiquetado</span>
              <span className="text-sm font-bold">{compliance.data.compliancePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-full rounded-full ${
                  compliance.data.compliancePercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${compliance.data.compliancePercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {compliance.data.compliantResources} de {compliance.data.totalResources} recursos con etiquetado completo
            </p>
          </div>
        </div>
      )}

      {/* Resources table */}
      {tags.isLoading && <div className="animate-pulse h-48 bg-muted rounded" />}

      {tags.data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 px-2">Recurso</th>
                <th className="py-3 px-2">Equipo</th>
                <th className="py-3 px-2">Proyecto</th>
                <th className="py-3 px-2">Ambiente</th>
                <th className="py-3 px-2">Caso de Uso IA</th>
              </tr>
            </thead>
            <tbody>
              {tags.data.map((tag) => (
                <tr key={tag.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2 font-medium">{tag.resourceId}</td>
                  <td className="py-3 px-2">{tag.team || <span className="text-red-400">—</span>}</td>
                  <td className="py-3 px-2">{tag.project || <span className="text-red-400">—</span>}</td>
                  <td className="py-3 px-2">{tag.environment || <span className="text-red-400">—</span>}</td>
                  <td className="py-3 px-2">{tag.aiUseCase || <span className="text-red-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
