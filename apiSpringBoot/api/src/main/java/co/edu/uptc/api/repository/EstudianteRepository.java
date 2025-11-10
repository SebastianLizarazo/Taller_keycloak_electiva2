package co.edu.uptc.api.repository;

import co.edu.uptc.api.model.Estudiante;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EstudianteRepository {
    private final DynamoDbTable<Estudiante> table;

    public EstudianteRepository(DynamoDbEnhancedClient enhancedClient) {
        this.table = enhancedClient.table("Students", TableSchema.fromBean(Estudiante.class));
    }

    public void save(Estudiante estudiante) {
        table.putItem(estudiante);
    }

    public Optional<Estudiante> findById(String id) {
        return Optional.ofNullable(table.getItem(r -> r.key(k -> k.partitionValue(id))));
    }

    public void delete(String id) {
        table.deleteItem(r -> r.key(k -> k.partitionValue(id)));
    }

    public List<Estudiante> findAll() {
        List<Estudiante> estudiantes = new ArrayList<>();
        table.scan().items().forEach(estudiantes::add);
        return estudiantes;
    }
}
