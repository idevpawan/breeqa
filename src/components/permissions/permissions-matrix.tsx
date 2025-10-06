"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PERMISSIONS, UserRole } from "@/lib/types/organization";

type Matrix = Record<string, Record<UserRole, boolean>>;

interface PermissionsMatrixProps {
  editable?: boolean;
  onChange?: (matrix: Matrix) => void;
}

const ROLE_ORDER: UserRole[] = [
  "admin",
  "manager",
  "developer",
  "designer",
  "qa",
  "viewer",
];

export function PermissionsMatrix({
  editable = false,
  onChange,
}: PermissionsMatrixProps) {
  const [matrix, setMatrix] = useState<Matrix>(() => {
    const initial: Matrix = {};
    Object.entries(PERMISSIONS).forEach(([key, perm]) => {
      initial[key] = ROLE_ORDER.reduce(
        (acc, role) => {
          acc[role] = perm.roles.includes(role);
          return acc;
        },
        {} as Record<UserRole, boolean>
      );
    });
    return initial;
  });

  const rows = useMemo(() => Object.entries(PERMISSIONS), []);

  const toggle = (permKey: string, role: UserRole) => {
    if (!editable) return;
    setMatrix((prev) => {
      const next = {
        ...prev,
        [permKey]: { ...prev[permKey], [role]: !prev[permKey][role] },
      };
      onChange?.(next);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4">Permission</th>
                {ROLE_ORDER.map((role) => (
                  <th
                    key={role}
                    className="px-2 py-2 font-medium text-muted-foreground capitalize"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, perm]) => (
                <tr key={key} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium">
                            {perm.resource}:{perm.action}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            Resource {perm.resource}, action {perm.action}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  {ROLE_ORDER.map((role) => (
                    <td key={role} className="px-2 py-2 text-center">
                      {editable ? (
                        <Switch
                          checked={matrix[key][role]}
                          onCheckedChange={() => toggle(key, role)}
                          aria-label={`${role} permission for ${perm.resource}:${perm.action}`}
                        />
                      ) : (
                        <span>{matrix[key][role] ? "✅" : "❌"}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editable && (
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={() => onChange?.(matrix)}>
              Save as new role
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PermissionsMatrix;
